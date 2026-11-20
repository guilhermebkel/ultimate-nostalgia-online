import { test as base, expect } from "@playwright/test";

// Why: tests must not depend on the network, so every request that leaves localhost (the GTM script) is aborted.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(
      (url) => url.hostname !== "localhost",
      (route) => route.abort(),
    );
    await use(page);
  },
});

export { expect };
