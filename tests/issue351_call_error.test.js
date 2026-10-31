import { test } from "node:test";
import assert from "node:assert/strict";
import { run } from "../src/commands/call.js";

async function runWith(result) {
  const lines = [];
  const originalLog = console.log;
  const originalExitCode = process.exitCode;
  console.log = (...parts) => {
    lines.push(parts.map((p) => (typeof p === "string" ? p : JSON.stringify(p))).join(" "));
  };
  process.exitCode = undefined;
  let failure = null;
  try {
    await run({ positionals: ["megabrain.test", "{}"], flags: { json: true }, callToolFn: async () => result });
  } catch (e) {
    failure = e;
  } finally {
    console.log = originalLog;
  }
  const exitCode = process.exitCode;
  process.exitCode = originalExitCode;
  if (failure) throw failure;
  return { exitCode, stdout: lines.join("\n") };
}

test("CALL_ISERROR", async () => {
  const result = { isError: true, content: [{ type: "text", text: "x" }] };
  const { exitCode, stdout } = await runWith(result);
  assert.equal(exitCode, 1);
  assert.deepEqual(JSON.parse(stdout), result);
});

test("CALL_STATUS_ERROR", async () => {
  const result = { status: "error" };
  const { exitCode, stdout } = await runWith(result);
  assert.equal(exitCode, 1);
  assert.deepEqual(JSON.parse(stdout), result);
});

test("CALL_OK", async () => {
  const result = { status: "ok", data: 1 };
  const { exitCode, stdout } = await runWith(result);
  assert.ok(exitCode === 0 || exitCode == null);
  assert.deepEqual(JSON.parse(stdout), result);
});

test("CALL_BUSINESS_FAILURE_MATRIX", async () => {
  const failCases = [
    { structuredContent: { status: "error" } },
    { structuredContent: { error_code: "INVALID_ARGUMENT" } },
    { content: [{ type: "text", text: JSON.stringify({ status: "error" }) }] },
    { content: [{ type: "text", text: JSON.stringify({ error_code: "NO_EXECUTABLE_ROUTE" }) }] },
  ];
  for (const r of failCases) {
    const { exitCode } = await runWith(r);
    assert.equal(exitCode, 1);
  }
  const okCases = [
    { content: [{ type: "text", text: "texto nao json" }], status: "ok" },
    { content: [{ type: "text", text: JSON.stringify({ status: "ok" }) }], structuredContent: { status: "ok" } },
  ];
  for (const r of okCases) {
    const { exitCode } = await runWith(r);
    assert.ok(exitCode === 0 || exitCode == null);
  }
});
