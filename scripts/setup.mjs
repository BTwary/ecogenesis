#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync, spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const ROOT = process.cwd();
const envPath = path.join(ROOT, ".env");
const examplePath = path.join(ROOT, ".env.example");
const startAfterSetup = process.argv.includes("--start");

function parseEnvValue(line) {
  const raw = line.slice(line.indexOf("=") + 1).trim();
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    const body = raw.slice(1, -1);
    if (raw.startsWith('"')) {
      try { return JSON.parse(raw); } catch { return body; }
    }
    return body;
  }
  return raw;
}

function readEnv(text) {
  const values = new Map();
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (match) values.set(match[1], parseEnvValue(trimmed));
  }
  return values;
}

function setEnvValue(text, key, value, comment) {
  const line = `${key}=${JSON.stringify(value)}`;
  const pattern = new RegExp(`^${key}\\s*=.*$`, "m");
  if (pattern.test(text)) return text.replace(pattern, line);
  const section = comment ? `\n# ${comment}\n` : "\n";
  return `${text.trimEnd()}${section}${line}\n`;
}

function run(command, args, label) {
  console.log(`\n▶ ${label}`);
  const isWindows = process.platform === "win32";
  const bin = isWindows && command === "npm" ? "npm.cmd" : command;
  const result = spawnSync(bin, args, { cwd: ROOT, stdio: "inherit", shell: isWindows });
  if (result.error) {
    console.error(`Could not start ${command}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`${label} failed with exit code ${result.status ?? "unknown"}.`);
    process.exit(result.status ?? 1);
  }
}

async function askKey(rl, label, current) {
  const masked = current ? `${current.slice(0, 4)}…${current.slice(-3)}` : "not configured";
  const answer = await rl.question(`${label} [${masked}] (Enter=keep/skip, -=clear, or paste key): `);
  if (!answer.trim()) return current;
  if (answer.trim() === "-") return "";
  return answer.trim();
}

function openBrowser(url) {
  try {
    if (process.platform === "win32") spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
    else if (process.platform === "darwin") spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
    else spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
  } catch { /* Browser opening is optional; the URL is printed either way. */ }
}

async function main() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 22 || (major === 22 && minor < 16)) {
    console.error(`ECOGENESIS requires Node.js 22.16 or newer. Current version: ${process.versions.node}`);
    console.error("Install the current Node.js LTS release from https://nodejs.org/ and run Setup-ECOGENESIS.bat again.");
    process.exit(1);
  }

  console.log("============================================================");
  console.log(" ECOGENESIS — first-time setup");
  console.log("============================================================");
  console.log("This setup creates your local configuration, installs packages,");
  console.log("initialises the database and runs the included regression tests.\n");

  let envText = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf8")
    : fs.readFileSync(examplePath, "utf8");
  let values = readEnv(envText);

  if (!values.get("DATABASE_URL")) {
    envText = setEnvValue(envText, "DATABASE_URL", "file:../db/custom.db", "Local SQLite database; stored under db/.");
    values = readEnv(envText);
  }
  const secret = values.get("AUTH_SECRET") ?? "";
  if (secret.length < 32) {
    envText = setEnvValue(envText, "AUTH_SECRET", crypto.randomBytes(48).toString("base64url"), "Generated automatically by setup.");
    values = readEnv(envText);
    console.log("✓ Generated a private authentication secret.");
  } else {
    console.log("✓ Existing authentication secret preserved.");
  }

  let openAq = values.get("OPENAQ_API_KEY") ?? "";
  let dataGov = values.get("DATA_GOV_IN_KEY") ?? "";
  if (stdin.isTTY) {
    const rl = createInterface({ input: stdin, output: stdout });
    try {
      console.log("\nOptional environmental API keys");
      console.log("The site also works without these keys using Open-Meteo, NASA POWER and GBIF.");
      console.log("OpenAQ and data.gov.in keys unlock additional ground-station records.\n");
      openAq = await askKey(rl, "OpenAQ API key", openAq);
      dataGov = await askKey(rl, "data.gov.in API key", dataGov);
    } finally {
      rl.close();
    }
  } else {
    console.log("Non-interactive setup: preserving API key values already in .env; optional keys remain blank if not supplied.");
  }
  envText = setEnvValue(envText, "OPENAQ_API_KEY", openAq, "Optional OpenAQ ground-station key.");
  envText = setEnvValue(envText, "DATA_GOV_IN_KEY", dataGov, "Optional India CPCB/data.gov.in key.");
  fs.writeFileSync(envPath, envText.endsWith("\n") ? envText : `${envText}\n`, { encoding: "utf8", mode: 0o600 });
  console.log("\n✓ Saved .env. API keys remain server-side and are excluded from Git by .gitignore.");

  run("npm", ["install", "--no-audit", "--no-fund"], "Install application dependencies");
  run("npm", ["run", "db:setup"], "Initialise the local database");
  run("npm", ["test"], "Run regression tests");

  console.log("\n============================================================");
  console.log(" ECOGENESIS setup completed");
  console.log("============================================================");
  console.log("Local URL: http://localhost:3000");
  console.log("Integration status: http://localhost:3000/api/env/status");
  console.log("API key guide: API-KEYS.md");
  console.log("\nImportant: Open-Meteo's hosted free API is for non-commercial use.");
  console.log("Copernicus direct imagery, Global Forest Watch and NWDP direct APIs");
  console.log("are not connected in this build; their keys are not requested here.\n");

  if (startAfterSetup) {
    const isWindows = process.platform === "win32";
    const bin = isWindows ? "npm.cmd" : "npm";
    console.log("Starting ECOGENESIS development server. Press Ctrl+C to stop.\n");
    const child = spawn(bin, ["run", "dev"], { cwd: ROOT, stdio: "inherit", shell: isWindows });
    const browserTimer = setTimeout(() => openBrowser("http://localhost:3000"), 3000);
    child.on("error", (error) => {
      clearTimeout(browserTimer);
      console.error(`Could not start the website: ${error.message}`);
      process.exitCode = 1;
    });
    child.on("exit", (code) => {
      clearTimeout(browserTimer);
      process.exitCode = code ?? 0;
    });
    process.on("SIGINT", () => child.kill("SIGINT"));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
