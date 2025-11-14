import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

const environment = process.env.NODE_ENV || "development";

dotenv.config({
  path: environment === "development" ? ".env" : `.env.${environment}`,
});

if (environment === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: "tests",

  // Run all tests in parallel.
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Reporter to use
  reporter: "html",

  workers: process.env.CI ? 1 : undefined,

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: process.env.URL || "https://www.dev.documentcloud.org",

    // Collect trace when retrying the failed test.
    trace: "on-first-retry",
  },

  // Web server for Storybook tests
  webServer: {
    command: "npm run storybook",
    url: "http://localhost:6006",
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes for Storybook to start
  },

  // Options specific to each project.
  projects: [
    {
      name: "chromium",
      use: devices["Desktop Chrome"],
    },
    {
      name: "firefox",
      use: devices["Desktop Firefox"],
    },
    {
      name: "webkit",
      use: devices["Desktop Safari"],
    },
    /* todo configure tests for mobile
    {
      name: "Mobile Chrome",
      use: devices["Pixel 5"],
    },
    {
      name: "Mobile Safari",
      use: devices["iPhone 12"],
    },
    */
  ],
});
