import { execFileSync } from "node:child_process";

// Why: the SEO tests read dist/, so the site is built once before any test file runs.
export default () => {
  execFileSync("node", ["scripts/build.mjs"], { stdio: "inherit" });
};
