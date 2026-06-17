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

// The frontend host we expect to land back on once login completes. Matching
// the exact host (rather than a broad `documentcloud.org` regex) avoids
// resolving early on intermediate `api.` redirect hops during the OAuth round
// trip.
const frontendHost = new URL(baseURL).hostname;

// The OAuth flow is a multi-hop redirect chain (frontend -> api -> Squarelet ->
// back). On a cold CI preview deploy each hop can be slow, so give the waits
// plenty of headroom and let the whole setup run long.
const NAV_TIMEOUT = 30_000;

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

  // Two ~30s navigation waits plus redirect latency can exceed the default
  // 30s test timeout, so give the whole setup room to finish.
  setup.setTimeout(120_000);

  // DocumentCloud -> Squarelet's hosted login form. Wait for the form itself
  // (not just the document) before filling, since we arrive here via a redirect.
  await page.goto(loginURL);
  const loginInput = page.locator("input[name=login]");
  await loginInput.waitFor({ state: "visible", timeout: NAV_TIMEOUT });
  await loginInput.fill(username!);
  await page.fill("input[name=password]", password!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  // Wait until we've actually left the login form. The click kicks off a form
  // POST followed by OAuth redirects; we're done when we either hit the MFA
  // opt-in interstitial or land back on the frontend host. (We can't just wait
  // for "squarelet.com" — we're already there, so that would resolve instantly
  // and race the navigation.)
  await page.waitForURL(
    (url) =>
      url.pathname.includes("/accounts/onboard") ||
      url.hostname === frontendHost,
    { timeout: NAV_TIMEOUT },
  );

  // Optional one-time MFA opt-in interstitial — only shows for some accounts,
  // so this branch is intentionally conditional, not dead code. `force` is
  // needed because the dev Django Debug Toolbar overlay can intercept the click.
  if (page.url().includes("/accounts/onboard")) {
    await page
      .getByRole("button", { name: "Skip", exact: true })
      .click({ force: true });
  }

  // We should land back on the frontend host, logged in. Matching the exact
  // host (rather than any "documentcloud.org" URL) avoids resolving on an
  // intermediate `api.` redirect. Asserting that no sign-in link remains is a
  // reliable signal regardless of which page we land on.
  await page.waitForURL((url) => url.hostname === frontendHost, {
    timeout: NAV_TIMEOUT,
  });
  await expect(page.getByRole("link", { name: /sign in|log in/i })).toHaveCount(
    0,
  );

  await page.context().storageState({ path: STORAGE_STATE });
});
