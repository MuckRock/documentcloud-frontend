// @ts-check

import { test, expect } from "@playwright/test";

test("basic manager rendering", async ({ page }) => {
  await page.goto("/app");

  await expect(page).toHaveTitle("DocumentCloud");
});
