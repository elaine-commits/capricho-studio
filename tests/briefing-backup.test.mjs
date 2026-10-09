import test from "node:test";
import assert from "node:assert/strict";
import { validateBackup, mergeBriefings } from "../lib/briefing-backup.mjs";
const item = {
  id: "1",
  title: "Teste",
  brand: "Capricho Imports",
  channel: "Site",
  sku: "CI1",
  objective: "Campanha",
  createdAt: "2026-10-09T12:00:00.000Z",
};
test("aceita backup válido", () =>
  assert.deepEqual(validateBackup({ version: 1, briefings: [item] }), [item]));
test("rejeita versão inválida", () =>
  assert.throws(() => validateBackup({ version: 2, briefings: [] })));
test("rejeita campos ausentes", () =>
  assert.throws(() =>
    validateBackup({ version: 1, briefings: [{ id: "1" }] }),
  ));
test("rejeita registros em excesso", () =>
  assert.throws(() =>
    validateBackup({ version: 1, briefings: Array(10001).fill(item) }),
  ));
test("mescla sem duplicar ids", () =>
  assert.deepEqual(
    mergeBriefings([item], [item, { ...item, id: "2" }]).map((x) => x.id),
    ["1", "2"],
  ));
test("deduplica ids repetidos no arquivo", () =>
  assert.deepEqual(
    mergeBriefings([], [item, item]).map((x) => x.id),
    ["1"],
  ));
