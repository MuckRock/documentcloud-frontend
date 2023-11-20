// @ts-check

import { test, expect } from "@playwright/test";

test("basic homepage test", async ({ page }) => {
  await page.goto("/home");

  await expect(page).toHaveTitle("Home | DocumentCloud");
});
