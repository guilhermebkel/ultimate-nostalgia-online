import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GameBuilder } from "@/Builders/GameBuilder";
import { SiteDataUtil } from "@/Utils/SiteDataUtil";
import { GameCard } from "./index";

const english = SiteDataUtil.localeOf("en");
const render = (game: Parameters<typeof GameCard>[0]["game"], locale = english) =>
  renderToStaticMarkup(<GameCard game={game} locale={locale} />);

describe("GameCard", () => {
  it("links a live game twice: the button and the banner that covers the card", () => {
    const html = render(GameBuilder.live());
    expect(html.match(/href="https:\/\/zerod\.example"/g)).toHaveLength(2);
    expect(html).toContain('data-track-status="live"');
  });

  it("gives a soon game no link at all", () => {
    const html = render(GameBuilder.soon());
    expect(html).not.toContain("<a ");
    expect(html).toContain('data-track-status="soon"');
    expect(html).toContain(english.status.soon);
  });

  it("escapes the texts that come from the locale files", () => {
    const locale = { ...english, games: { ...english.games, pebo: { name: "<b>x</b>", text: "a & b" } } };
    const html = render(GameBuilder.soon(), locale);
    expect(html).not.toContain("<b>x</b>");
    expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(html).toContain("a &amp; b");
  });

  it("fails when games.json and the card disagree on the status", () => {
    expect(() => render(GameBuilder.soon({ id: "zerod" }))).toThrow(/is "soon" in games.json/);
  });
});
