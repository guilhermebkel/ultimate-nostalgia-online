import { expect, test } from "./BaseTest.mjs";

const viewports = [
  { name: "phone", width: 390, height: 844 },
  { name: "small phone", width: 320, height: 640 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
];
const pages = ["/", "/pt-br/"];

for (const path of pages) {
  for (const viewport of viewports) {
    test.describe(`${path} at ${viewport.name} (${viewport.width}px)`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test("has no horizontal scroll", async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBe(0);
      });

      test("shows the three games and only Zerod is playable", async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("main article, main section")).toHaveCount(3);
        await expect(page.locator('main a[href^="https://zerod.guilherr.me"]')).toBeVisible();
        await expect(page.locator('main [aria-disabled="true"]')).toHaveCount(2);
        await expect(page.locator("main a")).toHaveCount(1);
      });
    });
  }
}

test.describe("Zerod card", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("keeps the card fan below the Play button on a phone", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const button = await page.locator("#zerod a").boundingBox();
    const fan = await page.locator("#fan").boundingBox();
    expect(button).not.toBeNull();
    expect(fan).not.toBeNull();
    expect(fan.y).toBeGreaterThanOrEqual(button.y + button.height);
  });
});

test("answers an unknown path with the 404 page", async ({ page }) => {
  const response = await page.goto("/old-uno-game/room");
  expect(response?.status()).toBe(404);
  await expect(page.locator("meta[name=robots]")).toHaveAttribute("content", "noindex");
});
