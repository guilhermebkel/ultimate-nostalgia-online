import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderPage } from "../src/templates/PageTemplate.mjs";

const readJson = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const site = readJson("src/data/site.json");
const locale = readJson("src/locales/en.json");
const locales = Object.fromEntries(site.locales.map((key) => [key, readJson(`src/locales/${key}.json`)]));
const art = {
  arrow: "<svg></svg>",
  fan: '<div id="fan"></div>',
  logo: "<svg></svg>",
  ogre: "<svg></svg>",
  peboWordmark: "<svg></svg>",
};
const render = (games, overrides = {}) =>
  renderPage({ site, locale: { ...locale, ...overrides }, locales, games, art });

describe("renderPage", () => {
  it("links a live game and disables a soon game", () => {
    const html = render([
      { id: "zerod", status: "live", url: "https://zerod.example" },
      { id: "pebo", status: "soon" },
    ]);
    expect(html).toContain('href="https://zerod.example"');
    expect(html.match(/aria-disabled="true"/g)).toHaveLength(1);
  });

  it("escapes the texts that come from the locale files", () => {
    const html = render([{ id: "pebo", status: "soon" }], { intro: '<script>alert("x")</script>' });
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  });

  it("writes the GitHub link of this repository in the footer", () => {
    const html = render([{ id: "pebo", status: "soon" }]);
    expect(html).toContain('href="https://github.com/guilhermebkel/ultimate-nostalgia-online"');
  });

  it("keeps a soon game out of the structured data", () => {
    const html = render([
      { id: "zerod", status: "live", url: "https://zerod.example" },
      { id: "pebo", status: "soon" },
    ]);
    const json = JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html)[1]);
    const apps = json["@graph"].filter((node) => node["@type"] === "WebApplication").map((node) => node.name);
    expect(apps).toEqual(["Zerod"]);
  });
});
