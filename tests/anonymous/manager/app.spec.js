// @ts-check

import { test, expect } from "@playwright/test";

test("basic manager rendering", async ({ page }) => {
  await page.goto("/app");

  const url = new URL(page.url());
  expect(url.pathname).toBe("/app");

  await expect(page).toHaveTitle("DocumentCloud");
});
