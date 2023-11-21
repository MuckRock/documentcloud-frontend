// @ts-check

import { test, expect } from "@playwright/test";

test("basic homepage test", async ({ page }) => {
  await page.goto("/home");

  await expect(page).toHaveTitle("Home | DocumentCloud");

  // go to the app
  await page.getByRole("banner").getByRole("link").first().click();

  // and back
  await page.getByRole("link", { name: "Home" }).click();

  await expect(page).toHaveTitle("Home | DocumentCloud");
});
