import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// ponytail: sync fs operations for CLI config; upgrade to async if integrated into high-concurrency daemon
export function getConfigDir() {
  return process.env.XDG_CONFIG_HOME
    ? path.join(process.env.XDG_CONFIG_HOME, "megabrain")
    : path.join(os.homedir(), ".config", "megabrain");
}

export function getConfigFile() {
  return path.join(getConfigDir(), "credentials.json");
}

export function loadConfig() {
  try {
    const file = getConfigFile();
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

export function saveConfig(data) {
  const dir = getConfigDir();
  const file = getConfigFile();
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  fs.chmodSync(dir, 0o700);
  const current = loadConfig();
  const merged = { ...current, ...data };
  fs.writeFileSync(file, JSON.stringify(merged, null, 2) + "\n", { mode: 0o600 });
  fs.chmodSync(file, 0o600);
}

export function getToken() {
  return process.env.MEGABRAIN_TOKEN || loadConfig().token || null;
}

export function setToken(token) {
  saveConfig({ token });
}

export function getEndpoint() {
  return process.env.MEGABRAIN_ENDPOINT || loadConfig().endpoint || "https://mcp.atlascommand.dev/mcp";
}

export function setEndpoint(endpoint) {
  saveConfig({ endpoint });
}
