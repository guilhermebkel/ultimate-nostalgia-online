import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures.mjs";

for (const path of ["/", "/pt-br/"]) {
  for (const width of [390, 1440]) {
    test(`${path} at ${width}px has no WCAG A or AA violations`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        violations.map(
          (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
        ),
      ).toEqual([]);
    });
  }
}
