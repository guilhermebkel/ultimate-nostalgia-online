import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);
const readText = (path) => readFileSync(new URL(path, root), "utf8");
const readJson = (path) => JSON.parse(readText(path));

const games = readJson("src/data/games.json");
const en = readJson("src/locales/en.json");

// Reads the rows of the "## Games" table of the README: [name, description, status, link].
const readmeRows = () => {
  const section = readText("README.md")
    .split(/^## /m)
    .find((part) => part.startsWith("Games\n"));
  if (!section) throw new Error("README.md has no '## Games' section");
  return section
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .slice(2)
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    );
};

// What the README must say for a game, built from the registry and the English texts.
const expectedRow = (game) => [
  en.games[game.id].name,
  en.games[game.id].text,
  en.status[game.status],
  game.status === "live" ? `[${new URL(game.url).host}](${game.url})` : "None yet",
];

describe("the README games table matches the site", () => {
  // Why: the README and the page both list the games; neither may drift from games.json or the English texts.
  it("lists every game of the registry, in the same order, and nothing else", () => {
    expect(readmeRows().map((row) => row[0])).toEqual(games.map((game) => en.games[game.id].name));
  });

  it.each(games.map((game) => [game.id, game]))("describes %s as the site does", (_id, game) => {
    const row = readmeRows().find((cells) => cells[0] === en.games[game.id].name);
    expect(row).toEqual(expectedRow(game));
  });
});
