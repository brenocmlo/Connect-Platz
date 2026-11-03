#!/usr/bin/env node
import { existsSync, cpSync } from "fs";
import { spawn } from "child_process";
import path from "path";

const rootDir = process.cwd();
const args = process.argv.slice(2);

let port = process.env.PORT;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "-p" || args[i] === "--port") {
    port = args[i + 1];
    break;
  }
}
if (!port) port = "3000";
process.env.PORT = port;

const standaloneServer = path.join(rootDir, ".next", "standalone", "server.js");

if (existsSync(standaloneServer)) {
  // Garantir que os arquivos estáticos estejam no diretório standalone para execução local/VPS
  const staticSrc = path.join(rootDir, ".next", "static");
  const staticDest = path.join(rootDir, ".next", "standalone", ".next", "static");
  const publicSrc = path.join(rootDir, "public");
  const publicDest = path.join(rootDir, ".next", "standalone", "public");

  if (existsSync(staticSrc) && !existsSync(staticDest)) {
    cpSync(staticSrc, staticDest, { recursive: true });
  }
  if (existsSync(publicSrc) && !existsSync(publicDest)) {
    cpSync(publicSrc, publicDest, { recursive: true });
  }

  const child = spawn("node", [standaloneServer], {
    stdio: "inherit",
    env: { ...process.env, PORT: port },
  });

  child.on("exit", (code) => process.exit(code ?? 0));
} else {
  const child = spawn("npx", ["next", "start", ...args], {
    stdio: "inherit",
    env: process.env,
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}
