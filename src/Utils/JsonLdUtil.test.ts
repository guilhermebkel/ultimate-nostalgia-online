import { describe, expect, it } from "vitest";
import { GameBuilder } from "@/Builders/GameBuilder";
import { JsonLdUtil } from "./JsonLdUtil";
import { SiteDataUtil } from "./SiteDataUtil";

const site = SiteDataUtil.SITE;
const locale = SiteDataUtil.localeOf("en");

describe("JsonLdUtil.graph", () => {
  it("keeps a soon game out of the structured data", () => {
    const { "@graph": graph } = JsonLdUtil.graph({ site, locale, games: [GameBuilder.live(), GameBuilder.soon()] });
    const apps = graph.filter((node) => node["@type"] === "WebApplication").map((node) => node.name);
    expect(apps).toEqual(["Zerod"]);
  });

  it("does not double the slash of a game url that ends with one", () => {
    const games = [GameBuilder.live({ id: "heros-play", url: "https://herosplay.online/" })];
    const { "@graph": graph } = JsonLdUtil.graph({ site, locale, games });
    const app = graph.find((node) => node["@type"] === "WebApplication");
    expect(app?.["@id"]).toBe("https://herosplay.online/#app");
  });
});
