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

const DEFAULT_ENDPOINT = "https://mcp.atlascommand.dev/mcp";
const SENSITIVE_QUERY_KEY = /token|key|bearer/i;

// ponytail: rejeita esquemas nao http(s), userinfo e query sensivel; upgrade to allowlist se endpoints legit precisarem query.
export function validateEndpoint(endpoint) {
  if (typeof endpoint !== "string" || endpoint.trim() === "") {
    throw new Error("Endpoint invalido: valor ausente");
  }
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Error("Endpoint invalido: URL malformada");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`Endpoint invalido: protocolo nao permitido (${url.protocol})`);
  }
  if (!url.hostname) throw new Error("Endpoint invalido: host ausente");
  if (url.username || url.password) {
    throw new Error("Endpoint invalido: credenciais (userinfo) nao permitidas");
  }
  for (const key of url.searchParams.keys()) {
    if (SENSITIVE_QUERY_KEY.test(key)) {
      throw new Error("Endpoint invalido: parametro de consulta sensivel nao permitido");
    }
  }
  return endpoint;
}

export function saveConfig(data) {
  const dir = getConfigDir();
  const file = getConfigFile();
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  fs.chmodSync(dir, 0o700);
  const current = loadConfig();
  const merged = { ...current, ...data };
  if (merged.endpoint !== undefined && merged.endpoint !== null) {
    merged.endpoint = validateEndpoint(merged.endpoint);
  }
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
  const envEndpoint = process.env.MEGABRAIN_ENDPOINT;
  if (typeof envEndpoint === "string" && envEndpoint.trim()) return validateEndpoint(envEndpoint);
  const stored = loadConfig().endpoint;
  if (stored !== undefined && stored !== null) {
    return validateEndpoint(stored);
  }
  return DEFAULT_ENDPOINT;
}

export function setEndpoint(endpoint) {
  saveConfig({ endpoint: validateEndpoint(endpoint) });
}
