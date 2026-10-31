import { getEndpoint, getToken, validateEndpoint } from "./config.js";

// ponytail: single-turn HTTP fetch; upgrade to persistent SSE reader / WebSocket when bidirectional server notifications needed
async function sendRpc(method, params = {}, options = {}) {
  const endpoint = validateEndpoint(options.endpoint || getEndpoint());
  const token = options.token !== undefined ? options.token : getToken();
  const origin = new URL(endpoint).origin;

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
    "Authorization": token ? `Bearer ${token}` : undefined,
    "Origin": origin,
    ...options.headers
  };
  if (!headers["Authorization"]) delete headers["Authorization"];
  headers["MCP-Protocol-Version"] = "2026-07-28";
  headers["Mcp-Method"] = method;
  if (method === "tools/call" && params.name) headers["Mcp-Name"] = params.name;
  params._meta = { ...(params._meta || {}), "io.modelcontextprotocol/protocolVersion": "2026-07-28" };
  params._meta["io.modelcontextprotocol/clientCapabilities"] = params._meta["io.modelcontextprotocol/clientCapabilities"] || { tools: {} };
  params._meta["io.modelcontextprotocol/clientInfo"] = params._meta["io.modelcontextprotocol/clientInfo"] || { name: "megabrain-cli", version: "3.2.0" };

  const id = Date.now();
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params
    }),
    signal: options.signal
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData?.error?.message) msg = `${msg} - ${errData.error.message}`;
    } catch {}
    throw new Error(msg);
  }

  const contentType = res.headers.get("content-type") || "";
  const match = (m) => Boolean(m && typeof m === "object" && m.jsonrpc === "2.0" && m.id === id && ("result" in m || "error" in m));
  let data;
  if (contentType.includes("text/event-stream")) {
    const text = (await res.text()).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    for (const frame of text.split(/\n{2,}/)) {
      const lines = frame.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).replace(/^ /, ""));
      if (!lines.length) continue;
      try {
        const m = JSON.parse(lines.join("\n"));
        if (match(m)) {
          data = m;
          break;
        }
      } catch {}
    }
  } else {
    try {
      const m = await res.json();
      if (match(m)) data = m;
    } catch {}
  }

  if (!data) throw new Error("Empty or invalid response from server");
  if (data.error) {
    throw new Error(data.error.message || `RPC Error ${data.error.code}`);
  }
  return data.result;
}

export async function callTool(name, args = {}, options = {}) {
  return sendRpc("tools/call", { name, arguments: args }, options);
}

export async function listTools(options = {}) {
  return sendRpc("tools/list", {}, options);
}

export async function checkHealth(options = {}) {
  const endpoint = options.endpoint || getEndpoint();
  const origin = new URL(endpoint).origin;
  try {
    const res = await fetch(`${origin}/health`, { signal: options.signal });
    if (res.ok) return await res.json();
  } catch {
    // fallback to tool/ping if /health route is unreachable
  }
  return callTool("megabrain.health", {}, options);
}
