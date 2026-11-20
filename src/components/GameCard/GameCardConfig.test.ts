import { describe, expect, it } from "vitest";
import { SiteDataUtil } from "@/Utils/SiteDataUtil";
import { GAME_ID_TO_CARD_CONFIG } from "./GameCardConfig";

describe("GAME_ID_TO_CARD_CONFIG", () => {
  // Why: a game added to games.json without a card would fail the build; this says it in a test first.
  it("has a card for every game of games.json, and no card for a game that is not there", () => {
    const ids = SiteDataUtil.GAMES.map((game) => game.id).sort();
    expect(Object.keys(GAME_ID_TO_CARD_CONFIG).sort()).toEqual(ids);
  });

  it("gives each card the same status as its game", () => {
    for (const game of SiteDataUtil.GAMES) {
      expect(GAME_ID_TO_CARD_CONFIG[game.id]?.status, game.id).toBe(game.status);
    }
  });

  it("makes exactly one card the page heading", () => {
    const headings = Object.values(GAME_ID_TO_CARD_CONFIG).filter(
      (config) => config.status === "live" && config.heading === "h1",
    );
    expect(headings).toHaveLength(1);
  });
});
