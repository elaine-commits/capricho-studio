import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { authorize, ApiError, failure } from "../../../../lib/auth";
import { db } from "../../../../lib/db";
export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await authorize();
    const { id } = await ctx.params;
    if (!/^[a-f0-9-]{36}$/.test(id))
      throw new ApiError(404, "Imagem não encontrada");
    const row = (
      await db().query(
        "SELECT data FROM studio_records WHERE id=$1 AND kind='assets'",
        [id],
      )
    ).rows[0];
    if (
      !row ||
      !new RegExp("^" + id + "\\.(png|jpg|webp)$").test(
        row.data.storageKey ?? "",
      )
    )
      throw new ApiError(404, "Imagem não encontrada");
    const bytes = await readFile(
      join(
        resolve(process.env.STUDIO_STORAGE_PATH ?? "storage"),
        row.data.storageKey,
      ),
    );
    return new Response(bytes, {
      headers: {
        "Content-Type": row.data.mime,
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return failure(e);
  }
}
