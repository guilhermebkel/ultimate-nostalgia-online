import { describe, expect, it } from "vitest";
import { SiteDataUtil } from "./SiteDataUtil";

describe("SiteDataUtil", () => {
  it("has every language of site.json", () => {
    for (const key of SiteDataUtil.SITE.locales) {
      expect(SiteDataUtil.localeOf(key).htmlLang).toBeTruthy();
    }
  });

  it("fails for a language it does not know", () => {
    expect(() => SiteDataUtil.localeOf("xx")).toThrow(/Unknown locale/);
  });
});
