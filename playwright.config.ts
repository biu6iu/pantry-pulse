import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run the real app against the test database, seeded from tests/fixtures.
// Locally the app is built first; CI has already built it by the time this runs.
const PORT = 3100;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  // every test reads the same seeded data, so they can run in parallel
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    // skips the count-up animations and smooth scrolling
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: isCI ? `npx next start -p ${PORT}` : `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    // never reuse a server that may be pointed at the real database
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "",
      DIRECT_URL: process.env.TEST_DATABASE_URL ?? "",
    },
  },
});
