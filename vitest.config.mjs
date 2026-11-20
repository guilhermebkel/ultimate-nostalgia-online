import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["tests/**/*.test.mjs", "scripts/**/*.test.mjs", "src/**/*.test.{ts,tsx}"],
    globalSetup: ["tests/BuildSetup.mjs"],
  },
});
