import { describe, expect, it } from "vitest";
import { SitemapUtil } from "./SitemapUtil";
import { SiteDataUtil } from "./SiteDataUtil";

describe("SitemapUtil.build()", () => {
  const xml = SitemapUtil.build(SiteDataUtil.SITE, "2026-11-20");

  it("lists one url per language with its last modified date", () => {
    expect(xml).toContain("<loc>https://uno.guilherr.me/</loc>");
    expect(xml).toContain("<loc>https://uno.guilherr.me/pt-br/</loc>");
    expect(xml.match(/<lastmod>2026-11-20<\/lastmod>/g)).toHaveLength(2);
  });

  it("points every url at every language", () => {
    expect(xml.match(/hreflang="pt-BR"/g)).toHaveLength(2);
  });
});
