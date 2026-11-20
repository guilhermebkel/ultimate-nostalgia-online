import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (file) => readFileSync(file, "utf8");
const pages = ["dist/index.html", "dist/pt-br/index.html"];

describe("tracking markup", () => {
  it.each(pages)("%s marks the four cards with their game and status", (file) => {
    const cards = [
      ...read(file).matchAll(/<(?:section|article) [^>]*data-track-card="([^"]+)" data-track-status="([^"]+)"/g),
    ];
    expect(cards.map((card) => [card[1], card[2]])).toEqual([
      ["zerod", "live"],
      ["heros-play", "live"],
      ["pebo", "soon"],
      ["ogro-party", "soon"],
    ]);
  });

  it.each(pages)("%s marks the banner and the button of each live game, and nothing else is clickable", (file) => {
    const clicks = [...read(file).matchAll(/data-track-click="([^"]+)"/g)].map((match) => match[1]);
    expect(clicks).toEqual(["banner", "button", "banner", "button"]);
  });

  it.each(pages)("%s marks the three footer links", (file) => {
    const links = [...read(file).matchAll(/data-track-link="([^"]+)"/g)].map((match) => match[1]);
    expect(links).toEqual(["feedback", "issue", "github"]);
  });

  it.each(pages)("%s loads the tracking script with defer", (file) => {
    expect(read(file)).toMatch(/<script src="[^"]*tracking\.js" defer><\/script>/);
  });
});

describe("tracking catalog", () => {
  it("documents exactly the events the script sends", () => {
    const sent = [...read("src/scripts/tracking.js").matchAll(/track\("([a-z_]+)"/g)].map((match) => match[1]);
    const documented = [...read("docs/tracking-standards.md").matchAll(/^### `([a-z_]+)`/gm)].map((match) => match[1]);
    expect(sent.sort()).toEqual(["footer_link_click", "game_card_click", "game_card_hover"]);
    expect(documented.sort()).toEqual(sent);
  });

  it("keeps every event name within the 40 characters of Google Analytics", () => {
    const names = [...read("docs/tracking-standards.md").matchAll(/^### `([a-z_]+)`/gm)].map((match) => match[1]);
    expect(names.filter((name) => name.length > 40)).toEqual([]);
  });
});
