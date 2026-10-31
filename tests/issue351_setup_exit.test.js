import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import os from "node:os";
import fs from "node:fs";
import http from "node:http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BIN = join(__dirname, "..", "bin", "megabrain.js");

function runSetup(dest, extra, env) {
  return spawnSync(process.execPath, [BIN, "setup", "--json", "--dest", dest, ...extra], {
    encoding: "utf8",
    timeout: 8000,
    env: { ...process.env, ...env }
  });
}

test("SETUP_DEGRADED_EXIT", () => {
  const dest = fs.mkdtempSync(join(os.tmpdir(), "mb376-"));
  try {
    const result = runSetup(dest, ["--endpoint", "http://127.0.0.1:1"], { MEGABRAIN_TOKEN: "sec-offline" });
    assert.notEqual(result.status, 0);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.status, "degraded");
    assert.equal(parsed.connectivity.connected, false);
    assert.equal(fs.existsSync(join(dest, "megabrain.mcp.json")), false);
    assert.ok(!result.stdout.includes("sec-offline"));
  } finally {
    fs.rmSync(dest, { recursive: true, force: true });
  }
});

test("SETUP_WRITE_MCP_NO_SECRET", () => {
  const dest = fs.mkdtempSync(join(os.tmpdir(), "mb376w-"));
  try {
    const result = runSetup(dest, ["--write-mcp", "--endpoint", "http://127.0.0.1:1"], { MEGABRAIN_TOKEN: "sec-write" });
    assert.notEqual(result.status, 0);
    const cfg = join(dest, "megabrain.mcp.json");
    assert.equal(fs.existsSync(cfg), true);
    const data = JSON.parse(fs.readFileSync(cfg, "utf8"));
    assert.equal(data.mcpServers.megabrain.headers.Authorization, "Bearer ${MEGABRAIN_TOKEN}");
    assert.ok(!result.stdout.includes("sec-write"));
    assert.ok(!JSON.stringify(data).includes("sec-write"));
  } finally {
    fs.rmSync(dest, { recursive: true, force: true });
  }
});

test("SETUP_HEALTHY_EXIT0", async () => {
  const dest = fs.mkdtempSync(join(os.tmpdir(), "mb376ok-"));
  const server = http.createServer((req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "READY" }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    const result = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [BIN, "setup", "--json", "--dest", dest, "--endpoint", `http://127.0.0.1:${port}`], { env: process.env });
      let stdout = "";
      child.stdout.on("data", (d) => { stdout += d; });
      child.on("error", reject);
      child.on("close", (status) => resolve({ status, stdout }));
    });
    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.status, "ok");
    assert.equal(parsed.connectivity.connected, true);
  } finally {
    server.close();
    fs.rmSync(dest, { recursive: true, force: true });
  }
});
test("SETUP_READINESS_DEGRADED_EXIT", async () => {
  let currentBody = {};
  const server = http.createServer((req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(currentBody));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const { port } = server.address();
  const cases = [
    { status: "DEGRADED" },
    { status: "NOT_READY" },
    { status: "READY", ready: false },
    { status: "READY", kernel_ready: false },
    { status: "READY", isError: true }
  ];
  const dests = [];
  try {
    for (const body of cases) {
      currentBody = body;
      const dest = fs.mkdtempSync(join(os.tmpdir(), "mb445d-"));
      dests.push(dest);
      const res = await new Promise((resolve, reject) => {
        const c = spawn(process.execPath, [BIN, "setup", "--json", "--dest", dest, "--endpoint", `http://127.0.0.1:${port}`], { env: process.env });
        let out = "";
        c.stdout.on("data", (d) => { out += d; });
        c.on("error", reject);
        c.on("close", (status) => resolve({ status, out }));
      });
      assert.notEqual(res.status, 0);
      assert.equal(JSON.parse(res.out).status, "degraded");
    }
  } finally {
    server.close();
    for (const d of dests) fs.rmSync(d, { recursive: true, force: true });
  }
});
