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

function mockFetch(capture) {
  globalThis.fetch = async (url, init) => {
    capture.url = String(url);
    capture.init = init;
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: {
        get: (name) => (name.toLowerCase() === "content-type" ? "application/json" : null)
      },
      json: async () => ({ jsonrpc: "2.0", id: 1, result: { ok: true } })
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
