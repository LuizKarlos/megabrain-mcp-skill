import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { checkHealth } from "../client.js";
import { getEndpoint, getToken, validateEndpoint } from "../config.js";

const SKILLS = [
  "megabrain-orchestrate",
  "megabrain-pipeline",
  "megabrain-review",
  "megabrain-audit",
  "megabrain-context",
  "megabrain-ui"
];

// ponytail: synchronous copy and unary probe; upgrade to async workers when syncing >50 skills
export async function run({ positionals = [], flags = {} } = {}) {
  if (flags?.help) {
    console.log("Usage: megabrain setup [--dest <path>] [--endpoint <url>] [--json]");
    return;
  }

  const endpoint = flags?.endpoint || getEndpoint();
  validateEndpoint(endpoint);
  const token = getToken();
  const rootDir = fileURLToPath(new URL("../../", import.meta.url));
  const destArg = typeof flags?.dest === "string" ? flags.dest : (positionals[0] || null);
  const destDir = destArg || path.join(process.cwd(), ".agents", "skills");

  fs.mkdirSync(destDir, { recursive: true });
  const installed = [];
  for (const item of [...SKILLS, "scripts"]) {
    const src = path.join(rootDir, item);
    if (fs.existsSync(src)) {
      fs.cpSync(src, path.join(destDir, item), { recursive: true });
      installed.push(item);
    }
  }

  const harnesses = [];
  const cursorDir = path.join(process.cwd(), ".cursor");
  if (fs.existsSync(cursorDir)) {
    harnesses.push(".cursor");
    const rulesDir = path.join(cursorDir, "rules");
    fs.mkdirSync(rulesDir, { recursive: true });
    fs.writeFileSync(path.join(rulesDir, "megabrain.mdc"), "# MegaBrain Rules\nUse MegaBrain MCP tools.\n");
  }
  if (fs.existsSync(path.join(process.cwd(), ".vscode"))) harnesses.push(".vscode");
  if (fs.existsSync(path.join(os.homedir(), ".hermes"))) harnesses.push(".hermes");

  const mcpConfig = {
    mcpServers: {
      megabrain: {
        url: endpoint,
        headers: token ? { Authorization: "Bearer ${MEGABRAIN_TOKEN}" } : {}
      }
    }
  };
  if (flags?.["write-mcp"] || flags?.writeMcp) fs.writeFileSync(path.join(destDir, "megabrain.mcp.json"), JSON.stringify(mcpConfig, null, 2) + "\n");

  const nodeMajor = parseInt(process.versions.node.split(".")[0], 10);
  const nodeOk = nodeMajor >= 18;

  function healthReady(health) {
    if (!health || typeof health !== "object") return false;
    const s = health.status != null ? String(health.status).toUpperCase() : "";
    if (s === "DEGRADED" || s === "NOT_READY") return false;
    if (health.ready === false || health.kernel_ready === false || health.isError === true) return false;
    return true;
  }

  let connected = false;
  const start = Date.now();
  try {
    const health = await checkHealth({ endpoint, token, signal: AbortSignal.timeout(3000) });
    connected = healthReady(health);
  } catch {}
  const latencyMs = Date.now() - start;

  const report = {
    status: nodeOk && connected ? "ok" : "degraded",
    prerequisites: { node: { version: process.version, valid: nodeOk } },
    connectivity: { endpoint, connected, latencyMs },
    installation: { destination: destDir, installed },
    harnesses,
    mcpConfig
  };

  if (flags?.json) {
    console.log(JSON.stringify(report));
  } else {
    console.log(`MegaBrain Setup: ${report.status.toUpperCase()}`);
    console.log(`- Node.js: ${process.version} (${nodeOk ? "OK" : "Requires >= 18"})`);
    console.log(`- Connectivity: ${connected ? "Connected" : "Offline"} (${latencyMs}ms) to ${endpoint}`);
    console.log(`- Installed ${installed.length} items to ${destDir}`);
    if (harnesses.length) console.log(`- Harnesses: ${harnesses.join(", ")}`);
  }
  if (report.status !== "ok") process.exitCode = 1;
  return report;
}
