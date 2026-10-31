import test, { after } from "node:test";
import assert from "node:assert/strict";
import { callTool, listTools } from "../src/client.js";

const ENDPOINT = "https://mcp.example.test/mcp";
const TOKEN = "secret-token-value";
const PROTOCOL_VERSION = "2026-07-28";

const originalFetch = globalThis.fetch;
after(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(capture, resHandler) {
  globalThis.fetch = async (url, init) => {
    capture.url = String(url);
    capture.init = init;
    const reqId = init?.body ? JSON.parse(init.body).id : undefined;
    if (resHandler) return resHandler(reqId, init);
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: {
        get: (name) => (name.toLowerCase() === "content-type" ? "application/json" : null)
      },
      json: async () => ({ jsonrpc: "2.0", id: reqId, result: { ok: true } })
    };
  };
  return capture;
}

test("TR_HEADERS_HEALTH: tools/call sends contract headers and protocol _meta", async () => {
  const capture = mockFetch({});

  await callTool("megabrain.health", {}, { endpoint: ENDPOINT, token: TOKEN });

  const { headers } = capture.init;
  assert.equal(headers["MCP-Protocol-Version"], PROTOCOL_VERSION);
  assert.equal(headers["Mcp-Method"], "tools/call");
  assert.equal(headers["Mcp-Name"], "megabrain.health");
  assert.equal(headers["Authorization"], `Bearer ${TOKEN}`);

  const body = JSON.parse(capture.init.body);
  assert.equal(body.method, "tools/call");
  assert.equal(body.params.name, "megabrain.health");
  assert.equal(body.params._meta["io.modelcontextprotocol/protocolVersion"], PROTOCOL_VERSION);
  assert.equal(typeof body.params._meta["io.modelcontextprotocol/clientCapabilities"], "object");
  assert.ok(body.params._meta["io.modelcontextprotocol/clientCapabilities"] !== null);
  assert.ok(!Array.isArray(body.params._meta["io.modelcontextprotocol/clientCapabilities"]));
  assert.ok("tools" in body.params._meta["io.modelcontextprotocol/clientCapabilities"]);
});

test("TR_HEADERS_LIST: tools/list sends contract headers without Mcp-Name", async () => {
  const capture = mockFetch({});

  await listTools({ endpoint: ENDPOINT, token: TOKEN });

  const { headers } = capture.init;
  assert.equal(headers["MCP-Protocol-Version"], PROTOCOL_VERSION);
  assert.equal(headers["Mcp-Method"], "tools/list");
  assert.equal(headers["Mcp-Name"], undefined);

  const body = JSON.parse(capture.init.body);
  assert.equal(body.method, "tools/list");
  assert.equal(body.params._meta["io.modelcontextprotocol/protocolVersion"], PROTOCOL_VERSION);
});

test("TR_NO_TOKEN_IN_URL: bearer token never reaches the URL", async () => {
  const capture = mockFetch({});

  await callTool("megabrain.health", {}, { endpoint: ENDPOINT, token: TOKEN });

  assert.equal(capture.url, ENDPOINT);
  assert.ok(!capture.url.includes(TOKEN));
  assert.ok(!capture.url.toLowerCase().includes("token"));
  assert.ok(!capture.url.includes("?"));
  assert.equal(capture.init.headers["Authorization"], `Bearer ${TOKEN}`);
});


test("TR_SSE_CORRELATED: ignores progress and foreign id, matches frame with CRLF/LF", async () => {
  mockFetch({}, (id) => ({
    ok: true,
    status: 200,
    headers: { get: (name) => (name.toLowerCase() === "content-type" ? "text/event-stream" : null) },
    text: async () => [
      'data: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progress":50}}',
      'data: {"jsonrpc":"2.0","id":999,"result":{"wrong":true}}',
      `data: {"jsonrpc":"2.0",\r\ndata: "id":${id},"result":{"toolResult":"ok"}}`
    ].join("\r\n\r\n")
  }));

  const res = await callTool("megabrain.health", {}, { endpoint: ENDPOINT, token: TOKEN });
  assert.deepEqual(res, { toolResult: "ok" });
});

test("TR_SSE_NO_CORRELATED: fails explicitly when no correlated frame exists", async () => {
  mockFetch({}, () => ({
    ok: true,
    status: 200,
    headers: { get: (name) => (name.toLowerCase() === "content-type" ? "text/event-stream" : null) },
    text: async () => 'data: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progress":100}}\n\n'
  }));

  await assert.rejects(
    async () => callTool("megabrain.health", {}, { endpoint: ENDPOINT, token: TOKEN }),
    /Empty or invalid response/
  );
});

test("TR_JSON_WRONG_ID: fails explicitly when simple JSON has mismatched id", async () => {
  mockFetch({}, () => ({
    ok: true,
    status: 200,
    headers: { get: (name) => (name.toLowerCase() === "content-type" ? "application/json" : null) },
    json: async () => ({ jsonrpc: "2.0", id: 999999, result: { ok: true } })
  }));

  await assert.rejects(
    async () => callTool("megabrain.health", {}, { endpoint: ENDPOINT, token: TOKEN }),
    /Empty or invalid response/
  );
});

test("TR_ERROR_PRESERVED: preserves RPC error from correlated response", async () => {
  mockFetch({}, (id) => ({
    ok: true,
    status: 200,
    headers: { get: (name) => (name.toLowerCase() === "content-type" ? "application/json" : null) },
    json: async () => ({ jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } })
  }));

  await assert.rejects(
    async () => callTool("megabrain.health", {}, { endpoint: ENDPOINT, token: TOKEN }),
    /Method not found/
  );
});
