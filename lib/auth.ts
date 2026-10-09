import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { db } from "./db";
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function currentUser() {
  const token = (await cookies()).get("studio_session")?.value;
  if (!token) return null;
  const result = await db().query(
    "SELECT u.id,u.email,u.display_name,u.role FROM studio_sessions s JOIN studio_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.active=true",
    [digest(token)],
  );
  return result.rows[0] ?? null;
}
export async function authorize(write = false, review = false) {
  const user = await currentUser();
  if (!user) throw new ApiError(401, "Autenticação necessária");
  if (
    (write && !["admin", "editor"].includes(user.role)) ||
    (review && !["admin", "reviewer"].includes(user.role))
  )
    throw new ApiError(403, "Permissão insuficiente");
  return user;
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!process.env.APP_URL) throw new ApiError(503, "APP_URL não configurada");
  if (origin !== new URL(process.env.APP_URL).origin)
    throw new ApiError(403, "Origem não autorizada");
}
export function failure(error: unknown) {
  if (error instanceof ApiError)
    return Response.json({ error: error.message }, { status: error.status });
  return Response.json(
    { error: "Serviço indisponível. Consulte a configuração do servidor." },
    { status: 503 },
  );
}
export async function readJson(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Corpo JSON necessário");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 32768) {
        await reader.cancel();
        throw new ApiError(413, "Requisição maior que 32 KB");
      }
      chunks.push(value);
    }
    const buffer = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    try {
      return JSON.parse(new TextDecoder().decode(buffer));
    } catch {
      throw new ApiError(400, "JSON inválido");
    }
  } finally {
    reader.releaseLock();
  }
}
