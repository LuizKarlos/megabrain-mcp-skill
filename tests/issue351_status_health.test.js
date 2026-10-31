import test from "node:test";
import assert from "node:assert";
import http from "node:http";
import { execFile } from "node:child_process";

test("cli status health classification and exit codes", async () => {
  let handler;
  const server = http.createServer((req, res) => handler(req, res));
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const endpoint = `http://127.0.0.1:${server.address().port}/mcp`;

  const runCli = (args = []) =>
    new Promise((resolve) => {
      execFile(process.execPath, ["bin/megabrain.js", "status", "--endpoint", endpoint, ...args], (err, stdout) => {
        resolve({ code: err ? err.code : 0, stdout: stdout || "" });
      });
    });

  try {
    // 1. 404 + isError fallback
    handler = (req, res) => {
      if (req.url === "/health") return res.writeHead(404).end();
      let b = "";
      req.on("data", (c) => (b += c));
      req.on("end", () => {
        const id = JSON.parse(b || "{}").id ?? null;
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ jsonrpc: "2.0", id, result: { isError: true, content: ["fail"] } }));
      });
    };
    const c1 = await runCli(["--json"]);
    const d1 = JSON.parse(c1.stdout);
    assert.strictEqual(c1.code, 1);
    assert.strictEqual(d1.status, "error");
    assert.strictEqual(d1.health?.isError, true);

    // 2. DEGRADED/ready=false
    handler = (_req, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: "DEGRADED", ready: false }));
    };
    const c2 = await runCli(["--json"]);
    const d2 = JSON.parse(c2.stdout);
    assert.strictEqual(c2.code, 1);
    assert.strictEqual(d2.status, "DEGRADED");
    assert.strictEqual(d2.health?.ready, false);

    // 3. READY exit0
    handler = (_req, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: "READY", ready: true }));
    };
    const c3 = await runCli(["--json"]);
    const d3 = JSON.parse(c3.stdout);
    assert.strictEqual(c3.code, 0);
    assert.strictEqual(d3.status, "READY");

    // 4. objeto insuficiente não-ok
    handler = (_req, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({}));
    };
    const c4 = await runCli(["--json"]);
    const d4 = JSON.parse(c4.stdout);
    assert.strictEqual(c4.code, 1);
    assert.strictEqual(d4.status, "error");
  } finally {
    server.close();
  }
});
