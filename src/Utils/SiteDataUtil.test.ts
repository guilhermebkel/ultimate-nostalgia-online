import { describe, expect, it } from "vitest";
import { SiteDataUtil } from "./SiteDataUtil";

describe("SiteDataUtil.localeOf()", () => {
  it("has every language of site.json", () => {
    for (const key of SiteDataUtil.SITE.locales) {
      expect(SiteDataUtil.localeOf(key).htmlLang).toBeTruthy();
    }
  });
});
