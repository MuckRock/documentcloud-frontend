import { test as setup, expect } from "@playwright/test";

import { STORAGE_STATE } from "../playwright.config";

// Credentials for the test account. Set these in `.env` (or the CI secrets):
//
//   DC_TEST_USERNAME=...
//   DC_TEST_PASSWORD=...
//
// Use a dedicated, low-privilege account on the dev/staging environment —
// never a real production login.
const username = process.env.DC_TEST_USERNAME;
const password = process.env.DC_TEST_PASSWORD;

// Login is initiated on the API host (not the frontend), which then hands off
// to Squarelet for credential entry. Derive it from the frontend URL by
// swapping the `www.` subdomain for `api.`, or override with DC_API_URL.
const baseURL = process.env.URL || "https://www.dev.documentcloud.org";
const apiURL = process.env.DC_API_URL || baseURL.replace("//www.", "//api.");
const loginURL = `${apiURL.replace(/\/$/, "")}/accounts/login/squarelet?next=${encodeURIComponent(baseURL)}`;

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

  // DocumentCloud -> Squarelet's hosted login form.
  await page.goto(loginURL);
  await page.fill("input[name=login]", username!);
  await page.fill("input[name=password]", password!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  // New Squarelet accounts hit a one-time MFA opt-in interstitial before the
  // OAuth redirect completes. Skip it if present. `force` is needed because the
  // dev Django Debug Toolbar overlay can intercept the click.
  await page.waitForURL(/squarelet\.com|documentcloud\.org/, { timeout: 15_000 });
  if (page.url().includes("/accounts/onboard")) {
    await page
      .getByRole("button", { name: "Skip", exact: true })
      .click({ force: true });
  }

  // We should land back on DocumentCloud, logged in. Asserting that no sign-in
  // link remains is a reliable signal regardless of which page we land on.
  await page.waitForURL(/documentcloud\.org/, { timeout: 15_000 });
  await expect(
    page.getByRole("link", { name: /sign in|log in/i }),
  ).toHaveCount(0);

  await page.context().storageState({ path: STORAGE_STATE });
});
