import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ensureDeps } from "./ensure-deps.mjs";

const BASE_REF = "origin/main";

// Why: a change here can break any file or the built site, so the changed-files run proves nothing and the full check runs.
const SHARED_ROOT_PREFIXES = ["tsconfig", "scripts/", "src/Protocols/", "src/data/", "src/locales/", ".github/"];
const SHARED_ROOT_FILES = new Set([
  "package.json",
  "pnpm-lock.yaml",
  "eslint.config.mjs",
  ".oxlintrc.json",
  "knip.json",
  "next.config.ts",
  "postcss.config.mjs",
  "vitest.config.mjs",
  "playwright.config.mjs",
]);
const CHANGED_STEPS = ["format:check", "typecheck", "lint:oxlint", "lint:eslint", "quality", "test:changed"];

export const isSharedRoot = (path) => {
  return SHARED_ROOT_FILES.has(path) || SHARED_ROOT_PREFIXES.some((prefix) => path.startsWith(prefix));
};

export const planCheck = ({ base, changedPaths }) => {
  if (base === null) {
    return { kind: "full", reason: `${BASE_REF} could not be resolved` };
  }
  const sharedRoot = changedPaths.find(isSharedRoot);
  if (sharedRoot !== undefined) {
    return { kind: "full", reason: `${sharedRoot} is a shared root` };
  }
  return { kind: "changed", base };
};

const runGit = (args) => {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
};

const readGitLines = (text) => {
  return text === "" ? [] : text.split("\n");
};

const resolveBase = () => {
  try {
    return runGit(["merge-base", BASE_REF, "HEAD"]);
  } catch {
    return null;
  }
};

export const readChangedPaths = () => {
  const base = resolveBase();
  if (base === null) {
    return { base: null, changedPaths: [] };
  }
  // Why: `git diff <base>` leaves out files git does not track yet, and a new file is a change.
  const tracked = readGitLines(runGit(["diff", "--name-only", base]));
  const untracked = readGitLines(runGit(["ls-files", "--others", "--exclude-standard"]));
  return { base, changedPaths: [...new Set([...tracked, ...untracked])] };
};

const run = (args) => {
  return spawnSync("pnpm", args, { stdio: "inherit" }).status ?? 1;
};

const runChangedSteps = () => {
  for (const step of CHANGED_STEPS) {
    const status = run([step]);
    if (status !== 0) {
      return status;
    }
  }
  return 0;
};

const runChecks = () => {
  const depsStatus = ensureDeps();
  if (depsStatus !== 0) {
    return depsStatus;
  }
  const { base, changedPaths } = readChangedPaths();
  const plan = planCheck({ base, changedPaths });

  if (plan.kind === "full") {
    process.stdout.write(`Running the full pnpm check: ${plan.reason}.\n`);
    return run(["check"]);
  }
  if (changedPaths.length === 0) {
    process.stdout.write("Nothing changed since the base; nothing to check.\n");
    return 0;
  }
  return runChangedSteps();
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(runChecks());
}
