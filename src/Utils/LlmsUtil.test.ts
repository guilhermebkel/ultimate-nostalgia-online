import { describe, expect, it } from "vitest";
import { GameBuilder } from "@/Builders/GameBuilder";
import { LlmsUtil } from "./LlmsUtil";
import { SiteDataUtil } from "./SiteDataUtil";

describe("LlmsUtil.build", () => {
  const text = LlmsUtil.build([GameBuilder.live(), GameBuilder.soon()], SiteDataUtil.localeOf("en"));

  it("links a live game and lists a soon game without a link", () => {
    expect(text).toContain("- [Zerod](https://zerod.example):");
    expect(text).toMatch(/^- Pebo: /m);
  });
});
