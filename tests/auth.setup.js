import { test as setup, expect } from "@playwright/test";

import { STORAGE_STATE } from "../playwright.config.js";

// Credentials for the test account. Set these in `.env` (or the CI secrets):
//
//   DC_TEST_USERNAME=...
//   DC_TEST_PASSWORD=...
//
// Use a dedicated, low-privilege account on the dev/staging environment —
// never a real production login.
const username = process.env.DC_TEST_USERNAME;
const password = process.env.DC_TEST_PASSWORD;

/**
 * Logs in via Squarelet OAuth and saves the authenticated browser session to
 * `playwright/.auth/user.json`. The `authenticated` project reuses that state
 * so individual tests don't each have to log in.
 */
setup("authenticate", async ({ page }) => {
  setup.skip(
    !username || !password,
    "Set DC_TEST_USERNAME and DC_TEST_PASSWORD to run authenticated tests.",
  );

  // Kicking off login on DocumentCloud redirects to Squarelet for the actual
  // credential entry.
  await page.goto("/accounts/login/squarelet");

  // Squarelet's login form. Selectors may need adjusting if Squarelet's
  // markup changes — prefer accessible roles/labels where possible.
  await page.getByLabel(/username|email/i).fill(username);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();

  // After the OAuth round-trip we should land back on DocumentCloud, logged in.
  // Assert on something only visible to authenticated users so we fail loudly
  // if login didn't complete.
  await page.waitForURL(/documentcloud\.org/);
  await expect(
    page.getByRole("button", { name: /account|profile|sign out/i }).first(),
  ).toBeVisible();

  await page.context().storageState({ path: STORAGE_STATE });
});
