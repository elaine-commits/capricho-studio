import { cookies } from "next/headers";
import { checkOrigin, digest, failure } from "../../../../lib/auth";
import { db } from "../../../../lib/db";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const jar = await cookies();
    const token = jar.get("studio_session")?.value;
    if (token)
      await db().query("DELETE FROM studio_sessions WHERE token_hash=$1", [
        digest(token),
      ]);
    jar.delete("studio_session");
    return Response.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
