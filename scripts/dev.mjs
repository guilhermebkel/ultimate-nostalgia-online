// Why: the dev server serves public/, so the files that live outside the app are copied there first.
import { spawn } from "node:child_process";
import { prepare } from "./prepare.mjs";

await prepare();
spawn("pnpm", ["exec", "next", "dev"], { stdio: "inherit" });
