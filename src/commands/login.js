import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { setToken, setEndpoint } from "../config.js";

// ponytail: cli token persistence; upgrade to interactive oauth flow when supported
export async function run({ positionals = [], flags = {} }) {
  let token = flags.token || positionals[0];
  if (!token && stdin.isTTY) {
    const rl = readline.createInterface({ input: stdin, output: stdout });
    token = (await rl.question("Token: ")).trim();
    rl.close();
  }
  if (token) setToken(token);
  if (flags.endpoint) setEndpoint(flags.endpoint);
  const out = { status: "ok", token: Boolean(token), endpoint: flags.endpoint };
  console.log(flags.json ? JSON.stringify(out) : `Configured credentials for ${flags.endpoint}`);
  return out;
}
