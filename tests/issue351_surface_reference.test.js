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
test("megabrain surface roles part 6", () => {
  const fullDoc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const section = fullDoc.split("## Roles")[1].split("## Transportes e autenticação")[0];
  assert.ok(section, "roles section exists");
  const roleMatches = [...section.matchAll(/^- `([a-z_]+)` —/gm)];
  assert.strictEqual(roleMatches.length, 6, "must have exactly 6 canonical roles");
  const canonical = new Set(["mission_compiler", "cartographer", "implementer", "reviewer", "failure_diagnostician", "creative_copywriter"]);
  const foundRoles = new Set(roleMatches.map((m) => m[1]));
  assert.deepStrictEqual(foundRoles, canonical);
  assert.strictEqual(foundRoles.has("supervisor"), false);
  assert.ok(!roleMatches.some((m) => !canonical.has(m[1])));
  const caps = {
    mission_compiler: ["chat"], cartographer: ["chat"], implementer: ["chat", "tool_calling"],
    reviewer: ["chat"], failure_diagnostician: ["chat", "reasoning"], creative_copywriter: ["chat"]
  };
  for (const [r, expected] of Object.entries(caps)) {
    const line = section.split("\n").find((l) => l.startsWith(`- \`${r}\` —`));
    for (const c of expected) assert.ok(line?.includes(`\`${c}\``), `${r} missing ${c}`);
  }
  const aliases = [...section.matchAll(/^- `([a-z_]+)` -> `([a-z_]+)`/gm)];
  assert.strictEqual(aliases.length, 21, "must have exactly 21 aliases");
  for (const [, a, target] of aliases) assert.ok(canonical.has(target), `alias ${a} target ${target} not canonical`);
  const jsons = [...section.matchAll(/```json\n([\s\S]*?)\n```/g)].map((m) => JSON.parse(m[1]));
  assert.strictEqual(jsons.length, 2, "must parse exactly 2 JSON examples");
  assert.ok(jsons.some((j) => j.params?.name === "megabrain.decompose" && j.params?.arguments?.metadata?.recommended_role));
  assert.ok(jsons.some((j) => j.params?.name === "megabrain.dispatch_subtask"));
  assert.match(section, /zero providers\/models/);
  assert.match(section, /n[ãa]o executa infer[êe]ncia/);
});
test("megabrain surface transports and authentication part 7", () => {
  const doc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const sec = doc.split("## Transportes e autenticação")[1];
  assert.ok(sec, "section Transportes e autenticação exists");
  assert.match(sec, /Streamable HTTP[\s\S]*?POST \/mcp/);
  assert.match(sec, /http:\/\/127\.0\.0\.1:20130\/mcp/);
  assert.match(sec, /https:\/\/mcp\.atlascommand\.dev\/mcp/);
  assert.match(sec, /MegaBrainNativeMCPServer\.run_stdio_async/);
  assert.match(sec, /run_jsonrpc_stdio/);
  assert.match(sec, /sem `call_tool` in-process/);
  for (const h of ["Content-Type: application/json", "Accept: application/json, text/event-stream", "Authorization: Bearer", "MCP-Protocol-Version: 2026-07-28", "Mcp-Method", "Mcp-Name"]) {
    assert.ok(sec.includes(h), `header ${h} missing`);
  }
  for (const m of ["io.modelcontextprotocol/protocolVersion", "clientCapabilities", "clientInfo"]) {
    assert.ok(sec.includes(m), `meta field ${m} missing`);
  }
  assert.ok(sec.includes("2026-07-28"), "must contain protocol version 2026-07-28");
  for (const q of ["?token=", "?key=", "?bearer="]) assert.ok(sec.includes(q), `query ${q} missing`);
  assert.match(sec, /rejeitados com HTTP 401/);
  assert.match(sec, /mb_user_session/);
  assert.match(sec, /mb_admin_session/);
  assert.match(sec, /n[ãa]o autenticam/);
  const match = sec.match(/-d \x27(\{[\s\S]*?\})\x27/);
  assert.ok(match, "curl payload found");
  const payload = JSON.parse(match[1]);
  assert.strictEqual(payload.method, "tools/list");
  assert.strictEqual(payload.params?._meta?.["io.modelcontextprotocol/protocolVersion"], "2026-07-28");
});
test("megabrain surface observability part 8", () => {
  const doc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const sec = doc.split("## Observabilidade")[1];
  assert.ok(sec, "observability section exists");

  const section = sec.split("### Notificações de progresso")[0];
  assert.match(section, /\/metrics/);
  assert.match(section, /sem auth/);
  assert.doesNotMatch(section, /auth obrigat[oó]ria/i);

  for (const m of [
    "megabrain_tool_calls_total",
    "megabrain_arm_calls_total",
    "megabrain_errors_total",
    "megabrain_tool_errors_total",
    "megabrain_tool_duration_seconds_bucket",
    "megabrain_tool_duration_seconds_sum",
    "megabrain_tool_duration_seconds_count",
    "megabrain_tool_duration_seconds_total"
  ]) {
    assert.ok(sec.includes(m), "missing metric " + m);
  }

  const jsonMatch = sec.match(/```json\n([\s\S]*?)\n```/);
  assert.ok(jsonMatch, "json progress notification exists");
  const notif = JSON.parse(jsonMatch[1]);
  assert.equal(notif.method, "notifications/progress");
  assert.equal(notif.id, undefined);
  assert.ok(notif.params?.progressToken && notif.params?.progress && notif.params?.total && notif.params?.message);

  assert.match(sec, /progresso antes do resultado/);
  for (const f of ["total_calls", "total_errors", "tool_distribution", "uptime_seconds"]) {
    assert.ok(sec.includes(f), "missing field " + f);
  }
  assert.match(sec, /contadores vivos vs snapshot/);
  assert.match(sec, /sem SLA sem medi[çc][ãa]o/);
});
