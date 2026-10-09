import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  authorize,
  checkOrigin,
  ApiError,
  failure,
} from "../../../../lib/auth";
import { db } from "../../../../lib/db";
export async function POST(request: Request) {
  let client;
  let path: string | undefined;
  try {
    checkOrigin(request);
    const user = await authorize(true);
    const length = Number(request.headers.get("content-length"));
    if (!length || length > 10_500_000)
      throw new ApiError(413, "Upload exige tamanho declarado, máximo 10 MB");
    const form = await request.formData();
    const file = form.get("file");
    const productId = String(form.get("productId") ?? "");
    const source = String(form.get("source") ?? "").trim();
    if (
      !(file instanceof File) ||
      file.size > 10_000_000 ||
      file.size < 12 ||
      !source ||
      source.length > 3000 ||
      form.get("rightsConfirmed") !== "true" ||
      form.get("realPhoto") !== "true" ||
      !/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(productId)
    )
      throw new ApiError(
        400,
        "Arquivo, produto, origem e declarações obrigatórios",
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const png = bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp =
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP";
    if (!png && !jpeg && !webp)
      throw new ApiError(400, "Somente PNG, JPEG e WebP");
    try {
      await sharp(bytes, { limitInputPixels: 16_000_000 }).raw().toBuffer();
    } catch {
      throw new ApiError(400, "Imagem corrompida ou maior que 16 megapixels");
    }
    const extension = png ? "png" : jpeg ? "jpg" : "webp";
    const id = randomUUID();
    const root = resolve(process.env.STUDIO_STORAGE_PATH ?? "storage");
    await mkdir(root, { recursive: true });
    path = join(root, id + "." + extension);
    client = await db().connect();
    await client.query("BEGIN");
    if (
      !(
        await client.query(
          "SELECT id FROM studio_records WHERE id=$1 AND kind='products' AND status<>'archived' FOR SHARE",
          [productId],
        )
      ).rowCount
    )
      throw new ApiError(400, "Produto não encontrado");
    await writeFile(path, bytes, { flag: "wx", mode: 0o600 });
    const data = {
      productId,
      url: new URL("/api/assets/" + id, process.env.APP_URL).href,
      source,
      rightsConfirmed: true,
      realPhoto: true,
      storageKey: id + "." + extension,
      mime: png ? "image/png" : jpeg ? "image/jpeg" : "image/webp",
    };
    const result = (
      await client.query(
        "INSERT INTO studio_records(id,kind,title,data,created_by) VALUES($1,'assets',$2,$3,$4) RETURNING *",
        [id, file.name.slice(0, 120) || "Fotografia", data, user.id],
      )
    ).rows[0];
    await client.query(
      "INSERT INTO studio_audit_log(actor_user_id,entity_type,entity_id,action) VALUES($1,$2,$3,$4)",
      [user.id, "assets", id, "uploaded"],
    );
    await client.query("COMMIT");
    path = undefined;
    return Response.json(result, { status: 201 });
  } catch (e) {
    if (client) await client.query("ROLLBACK");
    if (path) await unlink(path).catch(() => {});
    return failure(e);
  } finally {
    client?.release();
  }
}
