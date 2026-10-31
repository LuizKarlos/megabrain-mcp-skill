import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("megabrain surface reference and package inclusion", () => {
  const fullDoc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const doc = fullDoc.split("## Superfície de governança e operação — parte 2")[0];
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
test("megabrain surface governance and operational tools part 2", () => {
  const fullDoc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const part2 = fullDoc.split("## Superfície de governança e operação — parte 2")[1];
  assert.ok(part2, "part 2 section exists");

  assert.match(part2, /sens[ií]vel/i, "mentions sensitive query rejection");
  assert.match(part2, /userinfo/i, "mentions userinfo rejection");
  assert.match(part2, /0\.05/, "mentions 0.05 default divergence");

  const pattern = /megabrain call ([\w.]+) '([^']+)'/g;
  const calls = {};
  for (const match of part2.matchAll(pattern)) {
    calls[match[1]] = JSON.parse(match[2]);
  }

  const expectedPart2Tools = [
    "megabrain.grant_approval",
    "megabrain.resume_pipeline",
    "megabrain.evaluate_execution_canary",
    "megabrain.get_mission_scorecard",
    "megabrain.get_telemetry_report",
    "megabrain.export_client_config"
  ];

  assert.deepEqual(Object.keys(calls).sort(), expectedPart2Tools.sort());
  assert.deepEqual(Object.keys(calls["megabrain.grant_approval"]).sort(), ["approver", "task_id", "work_id"]);
  assert.deepEqual(Object.keys(calls["megabrain.resume_pipeline"]).sort(), ["test_commands", "work_id"]);
  assert.deepEqual(Object.keys(calls["megabrain.evaluate_execution_canary"]).sort(), ["primary_output", "reference_output"]);
  assert.deepEqual(Object.keys(calls["megabrain.get_mission_scorecard"]), ["work_id"]);
  assert.deepEqual(Object.keys(calls["megabrain.get_telemetry_report"]), []);
  assert.deepEqual(Object.keys(calls["megabrain.export_client_config"]).sort(), ["client_type", "tunnel_url"]);

  assert.equal("token" in calls["megabrain.export_client_config"], false);
  assert.equal("auth_token" in calls["megabrain.export_client_config"], false);
});
