import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("megabrain surface reference and package inclusion", () => {
  const doc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

  assert.ok(pkg.files && pkg.files.includes("megabrain-surface"), "package.json files includes megabrain-surface");
  assert.ok(doc.includes("DEPRECATED"), "document contains DEPRECATED");
  assert.ok(doc.includes("NO_EXECUTABLE_ROUTE"), "document contains NO_EXECUTABLE_ROUTE");

  const pattern = /megabrain call ([\w.]+) '([^']+)'/g;
  const calls = {};
  for (const match of doc.matchAll(pattern)) {
    calls[match[1]] = JSON.parse(match[2]);
  }

  const expectedTools = [
    "megabrain.health",
    "megabrain.inspect",
    "megabrain.inspect_work",
    "megabrain.refine_prompt",
    "megabrain.recommend",
    "megabrain.infer"
  ];

  assert.deepEqual(Object.keys(calls).sort(), expectedTools.sort());
  assert.deepEqual(Object.keys(calls["megabrain.health"]), []);
  assert.deepEqual(Object.keys(calls["megabrain.inspect"]), ["mission_id"]);
  assert.deepEqual(Object.keys(calls["megabrain.inspect_work"]), ["work_id"]);
  assert.deepEqual(Object.keys(calls["megabrain.refine_prompt"]).sort(), ["context", "prompt", "risk_level"]);
  assert.deepEqual(Object.keys(calls["megabrain.recommend"]), ["instruction"]);
  assert.deepEqual(Object.keys(calls["megabrain.infer"]), ["instruction"]);
});
