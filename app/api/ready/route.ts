import { db } from "../../../lib/db";
export async function GET() {
  try {
    const result = await db().query(
      "SELECT count(*)::int AS count FROM studio_migrations WHERE name IN ('001_studio_foundation.sql','002_enterprise.sql')",
    );
    if (result.rows[0].count !== 2) throw new Error("MIGRATIONS_PENDING");
    return Response.json(
      { status: "ready" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "not_ready" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
