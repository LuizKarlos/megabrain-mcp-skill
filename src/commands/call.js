import { callTool } from "../client.js";

// ponytail: single tool caller; upgrade to multi-step agent pipeline when needed
export async function run({ positionals = [], flags = {}, callToolFn = callTool }) {
  const pos = Array.isArray(positionals) ? positionals : [];
  const [name, rawArgs] = pos;
  if (!name) throw new Error("Tool name required. Usage: megabrain call <tool> [args-json]");
  if (!String(name).startsWith("megabrain.")) throw new Error("Tool name must be megabrain.<tool>");
  if (pos.length > 2) throw new Error("Too many arguments. Usage: megabrain call <tool> [args-json]");
  let args = {};
  if (rawArgs) {
    try {
      args = JSON.parse(rawArgs);
    } catch (e) {
      throw new Error(`Invalid JSON arguments: ${e.message}`);
    }
    if (args === null || Array.isArray(args) || typeof args !== "object") {
      throw new Error("Arguments must be a JSON object");
    }
  }
  const result = await callToolFn(name, args, { endpoint: flags.endpoint, token: flags.token });
  const businessFail = result && (result.isError === true || String(result.status || "").toLowerCase() === "error");
  if (businessFail) process.exitCode = 1;
  if (flags.json) {
    console.log(JSON.stringify(result));
  } else {
    const formatted = typeof result === "object" ? JSON.stringify(result, null, 2) : result;
    console.log(formatted);
  }
  return result;
}
