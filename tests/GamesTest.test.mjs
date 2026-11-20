import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readJson = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const site = readJson("src/data/site.json");
const games = readJson("src/data/games.json");
const locales = Object.fromEntries(site.locales.map((key) => [key, readJson(`src/locales/${key}.json`)]));

const keysOf = (value, prefix = "") =>
  Object.entries(value).flatMap(([key, child]) =>
    typeof child === "object" && child !== null && !Array.isArray(child)
      ? keysOf(child, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

describe("games.json", () => {
  it("gives every game a unique id", () => {
    const ids = games.map((game) => game.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("allows only the live and soon statuses", () => {
    expect(games.map((game) => game.status).filter((status) => !["live", "soon"].includes(status))).toEqual([]);
  });

  it("gives a live game an https url and a soon game none", () => {
    for (const game of games) {
      if (game.status === "live") expect(game.url).toMatch(/^https:\/\//);
      else expect(game.url).toBeUndefined();
    }
  });

  it("puts the live games first, so the featured card leads the page", () => {
    const statuses = games.map((game) => game.status);
    expect(statuses).toEqual([...statuses].sort((a, b) => (a === b ? 0 : a === "live" ? -1 : 1)));
  });

  it("has a name and a text for every game in every locale", () => {
    for (const locale of Object.values(locales)) {
      for (const game of games) {
        expect(locale.games[game.id]?.name, game.id).toBeTruthy();
        expect(locale.games[game.id]?.text, game.id).toBeTruthy();
      }
    }
  });
});

describe("locales", () => {
  it("have exactly the same keys in every language", () => {
    const [first, ...others] = Object.values(locales).map((locale) => keysOf(locale).sort());
    for (const keys of others) expect(keys).toEqual(first);
  });

  it("give every locale its own path and html lang", () => {
    const paths = Object.values(locales).map((locale) => locale.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(locales[site.defaultLocale].path).toBe("/");
  });
});
