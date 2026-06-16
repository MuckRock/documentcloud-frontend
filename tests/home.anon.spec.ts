import { test, expect } from "@playwright/test";

// Logged-out smoke test. Files named `*.anon.spec.ts` run in the `chromium`
// project with no saved session.

test("home page loads for anonymous visitors", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/DocumentCloud/i);
});

test("anonymous visitor sees a sign-in entry point", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /sign in|log in/i }).first(),
  ).toBeVisible();
});
