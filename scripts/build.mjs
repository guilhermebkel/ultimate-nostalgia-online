// Builds the site into dist/: Tailwind CSS, one page per locale, the sitemap, llms.txt and the copied assets.
import { execFileSync } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderNotFound, renderPage } from "../src/templates/PageTemplate.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const read = (path) => readFile(join(root, path), "utf8");
const readJson = async (path) => JSON.parse(await read(path));

const lastModified = () => {
  try {
    return execFileSync("git", ["log", "-1", "--format=%cs", "--", "src", "design"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
};

const build = async () => {
  const site = await readJson("src/data/site.json");
  const games = await readJson("src/data/games.json");
  const locales = Object.fromEntries(
    await Promise.all(site.locales.map(async (key) => [key, await readJson(`src/locales/${key}.json`)])),
  );
  const art = {
    arrow: (await read("src/art/arrow.svg")).trim(),
    fan: (await read("src/art/fan.html")).trim(),
    logo: (await read("src/art/logo.svg")).trim(),
    ogre: (await read("src/art/ogre.svg")).trim(),
    peboWordmark: (await read("src/art/peboWordmark.svg")).trim(),
  };

  await rm(dist, { recursive: true, force: true });
  await mkdir(join(dist, "fonts"), { recursive: true });

  execFileSync("pnpm", ["exec", "tailwindcss", "-i", "src/input.css", "-o", "dist/style.css", "--minify"], {
    cwd: root,
    stdio: "inherit",
  });

  for (const key of site.locales) {
    const locale = locales[key];
    const folder = join(dist, locale.path);
    await mkdir(folder, { recursive: true });
    await writeFile(join(folder, "index.html"), renderPage({ site, locale, locales, games, art }));
  }
  await writeFile(join(dist, "404.html"), renderNotFound({ site, locale: locales[site.defaultLocale], art }));

  const modified = lastModified() || new Date().toISOString().slice(0, 10);
  const alternates = site.locales
    .map(
      (key) =>
        `    <xhtml:link rel="alternate" hreflang="${locales[key].htmlLang}" href="${site.url}${locales[key].path}"/>`,
    )
    .join("\n");
  const urls = site.locales
    .map(
      (key) =>
        `  <url>\n    <loc>${site.url}${locales[key].path}</loc>\n    <lastmod>${modified}</lastmod>\n${alternates}\n  </url>`,
    )
    .join("\n");
  await writeFile(
    join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
  );

  const en = locales[site.defaultLocale];
  const liveList = games
    .filter((game) => game.status === "live")
    .map((game) => `- [${en.games[game.id].name}](${game.url}): ${en.games[game.id].text}`)
    .join("\n");
  const soonList = games
    .filter((game) => game.status === "soon")
    .map((game) => `- ${en.games[game.id].name}: ${en.games[game.id].text}`)
    .join("\n");
  await writeFile(
    join(dist, "llms.txt"),
    `# uno\n\n> uno (Ultimate Nostalgia Online) is a hub of famous games remastered with multiplayer and new mechanics, to play with friends in the browser.\n\n## Games\n\n${liveList}\n\n## Coming soon\n\n${soonList}\n`,
  );

  await cp(join(root, "public"), dist, { recursive: true });
  await cp(join(root, "design/web"), dist, { recursive: true });
  await cp(join(root, "src/scripts/fan-tilt.js"), join(dist, "fan-tilt.js"));
  await cp(join(root, "src/scripts/tracking.js"), join(dist, "tracking.js"));
  await cp(
    join(root, "node_modules/@fontsource-variable/fredoka/files/fredoka-latin-wght-normal.woff2"),
    join(dist, "fonts/fredoka.woff2"),
  );
  await cp(
    join(root, "node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2"),
    join(dist, "fonts/figtree.woff2"),
  );
  await rm(join(dist, "head-snippet.html"), { force: true });
};

await build();
console.log("Built dist/");
