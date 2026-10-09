import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const schema = readFileSync(
  new URL("../db/migrations/001_studio_foundation.sql", import.meta.url),
  "utf8",
);
test("schema contains users, briefings and audit trail", () => {
  for (const name of ["studio_users", "studio_briefings", "studio_audit_log"])
    assert.match(schema, new RegExp("CREATE TABLE IF NOT EXISTS " + name));
});
test("briefing statuses have database constraint", () => {
  for (const status of [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "archived",
  ])
    assert.ok(schema.includes("'" + status + "'"));
});
test("briefings are linked to an actor", () =>
  assert.match(
    schema,
    /created_by uuid NOT NULL REFERENCES studio_users\(id\)/,
  ));
