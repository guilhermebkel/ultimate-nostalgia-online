import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const site = JSON.parse(read("src/data/site.json"));
const games = JSON.parse(read("src/data/games.json"));
const locales = site.locales.map((key) => JSON.parse(read(`src/locales/${key}.json`)));

const pageFile = (locale) => `dist${locale.path}index.html`;
const meta = (html, attribute, name) => new RegExp(`<meta ${attribute}="${name}" content="([^"]*)"`).exec(html)?.[1];
const link = (html, rel) => new RegExp(`<link rel="${rel}" href="([^"]*)"`).exec(html)?.[1];

describe.each(locales)("the page $htmlLang", (locale) => {
  const html = read(pageFile(locale));
  const url = `${site.url}${locale.path}`;

  it("has one h1 and a title and a description of a useful length", () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    const title = /<title>(.*?)<\/title>/.exec(html)[1];
    expect(title.length).toBeGreaterThanOrEqual(10);
    expect(title.length).toBeLessThanOrEqual(65);
    const description = meta(html, "name", "description");
    expect(description.length).toBeGreaterThanOrEqual(70);
    expect(description.length).toBeLessThanOrEqual(175);
  });

  it("points the canonical and og:url at its own absolute url", () => {
    expect(link(html, "canonical")).toBe(url);
    expect(meta(html, "property", "og:url")).toBe(url);
  });

  it("lists every language and x-default as alternates", () => {
    for (const other of locales)
      expect(html).toContain(`<link rel="alternate" hreflang="${other.htmlLang}" href="${site.url}${other.path}">`);
    expect(html).toContain(`<link rel="alternate" hreflang="x-default" href="${site.url}/">`);
  });

  it("sets the html lang and never blocks indexing", () => {
    expect(html).toContain(`<html lang="${locale.htmlLang}">`);
    expect(meta(html, "name", "robots")).not.toMatch(/noindex|nosnippet/);
  });

  it("has the social image, 1200 by 630, and the Twitter card", () => {
    expect(meta(html, "property", "og:image")).toBe(`${site.url}/og.png`);
    const png = readFileSync(new URL("dist/og.png", root));
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
    expect(meta(html, "name", "twitter:card")).toBe("summary_large_image");
  });

  it("has JSON-LD that parses and whose ids are unique", () => {
    const json = JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html)[1]);
    const ids = json["@graph"].map((node) => node["@id"]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has its text in the static html, with no script building it", () => {
    const text = html
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<style[\s\S]*?<\/style>/g, "")
      .replace(/<svg[\s\S]*?<\/svg>/g, "")
      .replace(/<[^>]+>/g, " ");
    expect(text.split(/\s+/).filter(Boolean).length).toBeGreaterThan(60);
    expect(html).not.toContain("data-i18n");
  });

  it("links only the live games, and each game is named", () => {
    for (const game of games) {
      expect(html).toContain(locale.games[game.id].name.replace(/&/g, "&amp;"));
      if (game.status === "soon") expect(html).not.toContain(`id="${game.id}-link"`);
    }
    expect(html.match(/<a [^>]*href="https:\/\/zerod\.guilherr\.me"/g)).toHaveLength(1);
  });

  it("only references files that exist in dist", () => {
    const refs = [...html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)]
      .map((match) => match[1])
      .filter((path) => path !== "/");
    for (const path of refs)
      expect(existsSync(new URL(`dist${path}`, root)) || existsSync(new URL(`dist${path}index.html`, root)), path).toBe(
        true,
      );
  });
});

describe("the site files", () => {
  it("lists every language in the sitemap with the same host as the canonical", () => {
    const sitemap = read("dist/sitemap.xml");
    for (const locale of locales) expect(sitemap).toContain(`<loc>${site.url}${locale.path}</loc>`);
  });

  it("points robots.txt at the sitemap and allows everything", () => {
    const robots = read("dist/robots.txt");
    expect(robots).toContain(`Sitemap: ${site.url}/sitemap.xml`);
    expect(robots).not.toMatch(/^Disallow: \/$/m);
  });

  it("serves the custom domain and tells search engines to skip the 404 page", () => {
    expect(read("dist/CNAME").trim()).toBe(new URL(site.url).hostname);
    expect(read("dist/404.html")).toContain('<meta name="robots" content="noindex">');
  });

  it("lists the live games and the soon games in llms.txt", () => {
    const llms = read("dist/llms.txt");
    expect(llms).toContain("## Games");
    expect(llms).toContain("## Coming soon");
  });
});
