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

      test("shows the four games and only Zerod and Hero's Play are playable", async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("main article, main section")).toHaveCount(4);
        await expect(page.locator('main a[href^="https://zerod.guilherr.me"]:not([aria-hidden])')).toBeVisible();
        await expect(page.locator('main a[href^="https://herosplay.online"]:not([aria-hidden])')).toBeVisible();
        // One link per live game that a keyboard or a screen reader reaches; the other covers the banner for the pointer.
        await expect(page.locator("main a:not([aria-hidden]), main button")).toHaveCount(2);
      });
    });
  }
}

test.describe("Zerod card", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("keeps the card fan below the Play button on a phone", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const button = await page.locator("#zerod a:not([aria-hidden])").boundingBox();
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

test("the whole Zerod banner opens the game in a new tab", async ({ page, context }) => {
  // The new tab is a page of the same context: answer its request locally instead of reaching the network.
  await context.route(
    (url) => url.hostname === "zerod.guilherr.me",
    (route) => route.fulfill({ contentType: "text/html", body: "<title>zerod</title>" }),
  );
  await page.goto("/");
  const card = page.locator("#zerod");
  const box = await card.boundingBox();
  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    // A point of the banner that is neither the button nor the text.
    page.mouse.click(box.x + box.width * 0.55, box.y + box.height * 0.3),
  ]);
  await popup.waitForLoadState();
  expect(popup.url()).toContain("zerod.guilherr.me");
});

test("the art of a coming soon card follows the pointer", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const card = page.locator("[data-tilt-card]").filter({ hasText: "Pebo" });
  const art = card.locator("[data-tilt-target]");
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2);
  await expect.poll(() => art.evaluate((element) => element.style.getPropertyValue("--tilt"))).not.toBe("");
  await page.mouse.move(box.x - 20, box.y - 20);
  await expect.poll(() => art.evaluate((element) => element.style.getPropertyValue("--tilt"))).toBe("0");
});

for (const width of [390, 1440]) {
  test(`the logo and the intro are centered under each other at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const logo = await page.locator("header a svg").first().boundingBox();
    const intro = await page.locator("header p").boundingBox();
    const middle = (box) => box.x + box.width / 2;
    expect(Math.abs(middle(logo) - width / 2)).toBeLessThan(2);
    expect(Math.abs(middle(intro) - width / 2)).toBeLessThan(2);
    expect(intro.y).toBeGreaterThan(logo.y + logo.height);
  });
}
