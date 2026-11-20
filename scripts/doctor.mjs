#!/usr/bin/env node
import fs from "node:fs";

const required = ["AUTH_SECRET", "DATABASE_URL"];
const optional = ["OPENAQ_API_KEY", "DATA_GOV_IN_KEY"];
const envPath = new URL("../.env", import.meta.url);
if (!fs.existsSync(envPath)) {
  console.error("No .env file found. Run Setup-ECOGENESIS.bat first.");
  process.exit(1);
}
const text = fs.readFileSync(envPath, "utf8");
const values = new Map();
for (const line of text.split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (!match) continue;
  let value = match[2].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
  values.set(match[1], value);
}
let failed = false;
for (const name of required) {
  const value = values.get(name) ?? "";
  const ok = name === "AUTH_SECRET" ? value.length >= 32 : Boolean(value);
  console.log(`${ok ? "OK" : "MISSING"}  ${name}${name === "AUTH_SECRET" ? " (at least 32 characters)" : ""}`);
  if (!ok) failed = true;
}
for (const name of optional) {
  const ok = Boolean(values.get(name));
  console.log(`${ok ? "CONFIGURED" : "OPTIONAL / NOT SET"}  ${name}`);
}
console.log("INFO  Open-Meteo, NASA POWER and GBIF do not require API keys in this build.");
console.log("INFO  Copernicus direct imagery, GFW and NWDP direct API integrations are not included.");
if (failed) process.exit(1);
console.log("Configuration file check passed. This does not test whether remote API credentials are valid.");
