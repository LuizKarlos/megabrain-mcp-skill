import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { test } from "node:test";
import { run } from "../src/commands/setup.js";

test("SETUP_INVALID_ENDPOINT: rejeita token na query antes de criar dest", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "setup-inv-"));
  const dest = path.join(tmp, "dest");
  try {
    await assert.rejects(
      () => run({ flags: { endpoint: "https://mcp.atlascommand.dev/mcp?token=abc", dest } }),
      /parametro de consulta sensivel nao permitido/
    );
    assert.equal(fs.existsSync(dest), false);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("SETUP_VALID_ENDPOINT: isola cwd e usa mock fetch sem tocar workspace real", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "setup-val-"));
  const [prevCwd, prevFetch, prevLog, prevExit] = [process.cwd(), globalThis.fetch, console.log, process.exitCode];
  process.chdir(tmp);
  console.log = () => {};
  globalThis.fetch = async () => new Response(JSON.stringify({ status: "ok" }), { status: 200, headers: { "content-type": "application/json" } });
  try {
    const report = await run({ flags: { endpoint: "http://127.0.0.1:9000/mcp", json: true } });
    assert.equal(report.connectivity.endpoint, "http://127.0.0.1:9000/mcp");
    assert.equal(report.connectivity.connected, true);
    assert.equal(fs.existsSync(path.join(tmp, ".agents", "skills")), true);
  } finally {
    process.chdir(prevCwd);
    globalThis.fetch = prevFetch;
    console.log = prevLog;
    process.exitCode = prevExit;
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  assert.equal(fs.existsSync(path.join(prevCwd, ".agents")), false);
});
