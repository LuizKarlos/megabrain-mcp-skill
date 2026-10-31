import { checkHealth } from "../client.js";
import { getEndpoint } from "../config.js";

// ponytail: unary health ping; upgrade to full telemetry snapshot when dashboard ready
export async function run({ flags = {} }) {
  const endpoint = flags.endpoint || getEndpoint();
  const health = await checkHealth({ endpoint, token: flags.token });
  const rawStatus = typeof health?.status === "string" ? health.status.toUpperCase() : "";
  const isOk = Boolean(health) && !health.isError && health.ready !== false && health.ok !== false &&
    (["READY", "HEALTHY", "OK"].includes(rawStatus) || (rawStatus === "" && (health.ready === true || health.ok === true)));
  if (!isOk) process.exitCode = 1;
  const status = isOk
    ? (health?.status || "ok")
    : (["ERROR", "DEGRADED", "NOT_READY"].includes(rawStatus) ? health.status : (health?.ready === false ? "not_ready" : "error"));
  const out = { endpoint, status, health };
  if (flags.json) {
    console.log(JSON.stringify(out));
  } else {
    console.log(`Endpoint: ${endpoint}\nStatus: ${out.status}`);
  }
  return out;
}
