import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["tests/**/*.test.mjs", "src/**/*.test.mjs"], globalSetup: ["tests/BuildSetup.mjs"] },
});
