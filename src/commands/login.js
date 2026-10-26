import { getToken, setToken, setEndpoint, getEndpoint } from "../config.js";

// ponytail: cli token persistence; upgrade to interactive oauth flow when supported
export async function run({ positionals = [], flags = {} }) {
  const token = getToken();
  if (!token) throw new Error("No token provided. Set MEGABRAIN_TOKEN.");
  if (token) setToken(token);
  if (flags.endpoint) setEndpoint(flags.endpoint);
  const effectiveEndpoint = flags.endpoint || getEndpoint();
  const out = { status: "ok", token: Boolean(token), endpoint: effectiveEndpoint };
  console.log(flags.json ? JSON.stringify(out) : `Configured credentials for ${effectiveEndpoint}`);
  return out;
}
