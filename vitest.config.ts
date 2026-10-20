import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // e2e/ holds the Playwright tests, run with npm run test:e2e
    include: ["tests/**/*.test.ts"],
    globalSetup: "./tests/global-setup.ts",
    fileParallelism: false,
  },
});