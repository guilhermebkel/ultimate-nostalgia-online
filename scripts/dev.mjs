// Builds the site, serves dist/ on http://localhost:4173 and rebuilds when src/, design/ or public/ change.
import { execFileSync, spawn } from "node:child_process";
import { watch } from "node:fs";

const build = () => execFileSync("node", ["scripts/build.mjs"], { stdio: "inherit" });
build();

const server = spawn("pnpm", ["exec", "serve", "dist", "--listen", "4173", "--no-clipboard"], { stdio: "inherit" });

let timer;
for (const folder of ["src", "design/web", "public"]) {
  watch(folder, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 150);
  });
}

process.on("SIGINT", () => {
  server.kill();
  process.exit(0);
});
