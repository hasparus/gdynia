import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure"
  }
})
