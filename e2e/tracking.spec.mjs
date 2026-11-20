import { expect, test } from "./fixtures.mjs";
import { CRITICAL_FLOW } from "./tags.mjs";

test.use({ viewport: { width: 1440, height: 900 } });

// Why: a hover is measured by the page clock, so the wait is on that clock and not on a fixed timer.
const holdFor = async (page, ms) => {
  const start = await page.evaluate(() => performance.now());
  await page.waitForFunction(({ from, wait }) => performance.now() - from >= wait, { from: start, wait: ms });
};

const events = (page) => page.evaluate(() => window.dataLayer.filter((entry) => entry.event));

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.dataLayer = [];
  });
  await page.goto("/");
  // Why: the links open another site, and the test has to stay on this page.
  await page.evaluate(() => document.addEventListener("click", (event) => event.preventDefault()));
});

test("sends nothing until the visitor does something", { tag: CRITICAL_FLOW }, async ({ page }) => {
  expect(await events(page)).toEqual([]);
});

test(
  "a click on the button of a live game says which game and that it was the button",
  { tag: CRITICAL_FLOW },
  async ({ page }) => {
    await page.locator("#zerod a:not([aria-hidden])").click();
    expect(await events(page)).toEqual([
      { event: "game_card_click", locale: "en", game_id: "zerod", status: "live", placement: "button" },
    ]);
  },
);

test("a click on the banner says it was the banner", { tag: CRITICAL_FLOW }, async ({ page }) => {
  const box = await page.locator("#heros-play").boundingBox();
  await page.mouse.click(box.x + box.width * 0.55, box.y + box.height * 0.3);
  expect(await events(page)).toEqual([
    { event: "game_card_click", locale: "en", game_id: "heros-play", status: "live", placement: "banner" },
  ]);
});

test("a click on a footer link says which one", { tag: CRITICAL_FLOW }, async ({ page }) => {
  await page.getByRole("link", { name: "GitHub" }).click();
  expect(await events(page)).toEqual([{ event: "footer_link_click", locale: "en", link: "github" }]);
});

test(
  "a hover of more than half a second on a card is sent when the pointer leaves",
  { tag: CRITICAL_FLOW },
  async ({ page }) => {
    const card = page.locator('[data-track-card="pebo"]');
    await card.scrollIntoViewIfNeeded();
    const box = await card.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await holdFor(page, 800);
    await page.mouse.move(box.x - 30, box.y - 30);
    const [hover] = await events(page);
    expect(hover).toMatchObject({ event: "game_card_hover", game_id: "pebo", status: "soon", locale: "en" });
    expect(hover.duration_ms % 100).toBe(0);
    expect(hover.duration_ms).toBeGreaterThanOrEqual(700);
    expect(hover.duration_ms).toBeLessThan(2000);
  },
);

test("a pointer that only passes over a card sends nothing", { tag: CRITICAL_FLOW }, async ({ page }) => {
  const card = page.locator('[data-track-card="pebo"]');
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await holdFor(page, 150);
  await page.mouse.move(box.x - 30, box.y - 30);
  expect(await events(page)).toEqual([]);
});
