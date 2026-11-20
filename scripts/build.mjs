// Why: the static export reads public/, so the copies are made before `next build`.
import { execFileSync } from "node:child_process";
import { prepare } from "./prepare.mjs";

await prepare();
execFileSync("pnpm", ["exec", "next", "build"], { stdio: "inherit" });
console.log("Built dist/");
