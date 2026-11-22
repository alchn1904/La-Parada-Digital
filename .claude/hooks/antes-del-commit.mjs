// Hook de Claude Code: antes de un `git commit` corre lint, tipos y pruebas.
// Si algo falla, bloquea el commit (código de salida 2) y muestra el motivo.
import { execSync } from "node:child_process";

let entrada = "";
for await (const trozo of process.stdin) entrada += trozo;

let comando = "";
try {
  comando = JSON.parse(entrada)?.tool_input?.command ?? "";
} catch {
  process.exit(0);
}

if (!/\bgit\s+commit\b/.test(comando)) process.exit(0);

for (const paso of ["npm run lint", "npm run typecheck", "npm test"]) {
  try {
    execSync(paso, { stdio: "pipe" });
  } catch (e) {
    console.error(`Commit bloqueado: falló "${paso}".\n${e.stdout?.toString() ?? ""}`);
    process.exit(2);
  }
}
process.exit(0);
