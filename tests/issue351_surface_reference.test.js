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
  const part2 = fullDoc.split("## Superfície de governança e operação — parte 2")[1].split("## Aliases underscore — 38/38")[0];
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
test("megabrain surface underscore aliases part 3", () => {
  const fullDoc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const aliasSection = fullDoc.split("## Aliases underscore — 38/38")[1];
  assert.ok(aliasSection, "alias section exists");

  const pairs = [...aliasSection.matchAll(/(megabrain\.([a-z0-9_]+))\s*->\s*(megabrain_([a-z0-9_]+))/g)];
  assert.equal(pairs.length, 38, "must contain exactly 38 alias pairs");

  const canonicalSet = new Set(pairs.map((p) => p[1]));
  const aliasSet = new Set(pairs.map((p) => p[3]));
  assert.equal(canonicalSet.size, 38, "38 unique canonical tools");
  assert.equal(aliasSet.size, 38, "38 unique alias tools");

  for (const match of pairs) {
    const [, canonical, canonTool, alias] = match;
    assert.equal(alias, `megabrain_${canonical.slice("megabrain.".length)}`);
    assert.equal(alias, `megabrain_${canonTool}`);
  }

  const exampleMatch = aliasSection.match(/megabrain call (megabrain_health)\s*'([^']+)'/);
  assert.ok(exampleMatch, "example call exists");
  assert.deepEqual(JSON.parse(exampleMatch[2]), {});

  assert.ok(aliasSection.includes("megabrain."), "mentions megabrain. rejection");
  assert.ok(aliasSection.includes("megabrain..health"), "mentions megabrain..health rejection");
  assert.match(aliasSection, /string vazia/i, "mentions string vazia rejection");
});
test("megabrain surface resources part 4", () => {
  const fullDoc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const resourceSection = fullDoc.split("## Resources — parte 4")[1];
  assert.ok(resourceSection, "resource section exists");

  const expectedUris = [
    "megabrain://workrecords",
    "megabrain://ledgers",
    "megabrain://contracts",
    "megabrain://workrecords/{work_id}",
    "megabrain://ledgers/{work_id}",
    "megabrain://contracts/{operation_id}"
  ];
  for (const uri of expectedUris) {
    assert.ok(resourceSection.includes(uri), `resource URI ${uri} is present`);
  }

  const jsonBlocks = [...resourceSection.matchAll(/```json\n([\s\S]*?)\n```/g)].map((m) => JSON.parse(m[1]));
  const req = jsonBlocks.find((b) => b.method === "resources/read");
  assert.ok(req, "resources/read request found");
  assert.equal(req.method, "resources/read");
  assert.equal(req.params.uri, "megabrain://workrecords/work-123");

  const err = jsonBlocks.find((b) => b.error && b.error.code === -32002);
  assert.ok(err, "error block found");
  assert.equal(err.error.code, -32002);
  assert.equal(err.error.message, "Resource not found");

  const success = jsonBlocks.find((b) => b.result && b.result.contents);
  assert.ok(success, "success block found");
  assert.ok(success.result.contents[0].uri && success.result.contents[0].mimeType && success.result.contents[0].text);

  assert.match(resourceSection, /megabrain call[\s\S]*?NAO le[\s\S]*?resources/i);
  assert.match(resourceSection, /POST \/mcp.*Bearer/i);
  assert.doesNotMatch(resourceSection, /megabrain call[^\n]*resource/i);
  assert.doesNotMatch(resourceSection, /resources?[^\n]*megabrain call/i);
});
test("megabrain surface prompts part 5", () => {
  const fullDoc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const section = fullDoc.split("## Prompts — parte 5")[1];
  assert.ok(section, "prompts section exists");
  assert.ok(section.includes("sovereign-mission") && section.includes("consensus-adjudication"));
  assert.ok(section.includes("objective") && section.includes("risk_level"));
  assert.ok(section.includes("task_id") && section.includes("min_confidence") && section.includes("required_verdict"));
  const jsonBlocks = [...section.matchAll(/```json\n([\s\S]*?)\n```/g)].map((m) => JSON.parse(m[1]));
  const gets = jsonBlocks.filter((b) => b.method === "prompts/get");
  assert.equal(gets.length, 2, "2 prompts/get requests");
  const sm = gets.find((b) => b.params?.name === "sovereign-mission");
  assert.ok(sm?.params?.arguments?.objective && sm?.params?.arguments?.risk_level);
  const ca = gets.find((b) => b.params?.name === "consensus-adjudication");
  assert.ok(ca?.params?.arguments?.task_id && ca?.params?.arguments?.min_confidence && ca?.params?.arguments?.required_verdict);
  const msg = jsonBlocks.find((b) => b.result?.messages);
  assert.equal(msg.result.messages[0].role, "user");
  assert.ok(msg.result.messages[0].content?.text);
  const err = jsonBlocks.find((b) => b.error?.code === -32602);
  assert.ok(err && err.error.message.includes("Invalid params"));
  assert.match(section, /megabrain call[\s\S]*?NAO executa[\s\S]*?prompts/i);
  assert.match(section, /POST \/mcp.*Bearer/i);
});
