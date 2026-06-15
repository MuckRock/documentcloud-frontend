import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load environment variables. Defaults to `.env`, or `.env.<NODE_ENV>` when
// NODE_ENV is set to something other than development.
const environment = process.env.NODE_ENV || "development";
dotenv.config({
  path: environment === "development" ? ".env" : `.env.${environment}`,
  quiet: true,
});

// The site under test. CI (deploy previews) sets URL to the preview target.
const baseURL = process.env.URL || "https://www.dev.documentcloud.org";

// Where the logged-in browser session is persisted by the auth setup project.
export const STORAGE_STATE = "playwright/.auth/user.json";

export default defineConfig({
  // E2E specs and the auth setup live here, separate from the Vitest unit
  // tests under `src/`.
  testDir: "tests",
  testMatch: /.*\.(spec|setup)\.ts/,

  // Run tests within a file in parallel.
  fullyParallel: true,

  // Fail the build on CI if a test.only was left in the source.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Limit workers on CI for stability; use the local default otherwise.
  workers: process.env.CI ? 1 : undefined,

  // Rich HTML report; don't auto-open it on CI.
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "html",

  // Shared settings for all projects.
  use: {
    baseURL,

    // The dev server uses self-signed certs; accept them here rather than
    // disabling TLS verification process-wide.
    ignoreHTTPSErrors: true,

    // Capture artifacts to debug failures.
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // Logs in once and saves the authenticated storage state for reuse.
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // Logged-out tests. Spec files named `*.anon.spec.ts` run here without a
    // saved session.
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.anon\.spec\.ts/,
    },

    // Authenticated tests reuse the session created by the setup project.
    // Any spec not matching the anon pattern runs here.
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE,
      },
      dependencies: ["setup"],
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*\.anon\.spec\.ts/,
    },

    // Add Firefox / WebKit projects here when ready for cross-browser runs.
  ],
});
