import { test, expect } from "@playwright/test";

// Authenticated test. Any `*.spec.ts` not matching the `*.anon.spec.ts`
// pattern runs in the `authenticated` project, reusing the session saved by
// the auth setup. These are skipped automatically when no test credentials
// are configured (the setup project skips and produces no storage state).

test("logged-in user lands on their documents", async ({ page }) => {
  await page.goto("/");
  // Replace with a real authenticated-only assertion for your UI.
  await expect(page).toHaveTitle(/DocumentCloud/i);
});
