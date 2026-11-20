// Why: the brand kit (design/web), the two self-hosted fonts and the browser scripts live outside the Next app, so they are copied into public/ for `next dev` and `next build`. The copies are git-ignored.
import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

const FONTS = [
  ["@fontsource-variable/fredoka", "fredoka-latin-wght-normal.woff2", "fredoka.woff2"],
  ["@fontsource-variable/figtree", "figtree-latin-wght-normal.woff2", "figtree.woff2"],
];
const SCRIPTS = ["fan-tilt.js", "tracking.js"];

export const prepare = async () => {
  await cp(join(root, "design/web"), publicDir, { recursive: true });
  await rm(join(publicDir, "head-snippet.html"), { force: true });
  await mkdir(join(publicDir, "fonts"), { recursive: true });
  for (const [pkg, file, name] of FONTS) {
    await cp(join(root, "node_modules", pkg, "files", file), join(publicDir, "fonts", name));
  }
  for (const script of SCRIPTS) {
    await cp(join(root, "src/scripts", script), join(publicDir, script));
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await prepare();
  console.log("Prepared public/");
}
