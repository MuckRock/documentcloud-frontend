// @ts-check

import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  console.log(page.url());
  // this is on staging; don't delete this document
  const title = "FINALSeasonal_allergies_pollen_and_mold_2023__EN_";
  const url =
    "/documents/20000007-finalseasonal_allergies_pollen_and_mold_2023__en";
  await page.goto(url);

  await expect(page.locator(".sidebar").getByRole("heading")).toHaveText(title);

  await page.getByRole("link", { name: "Original Document (PDF) »" }).click();

  await expect(page.locator("h1")).toHaveText(title);

  await page.getByRole("link", { name: "p. 1" }).click();

  const currentUrl = new URL(page.url());

  expect(currentUrl.hash).toEqual("#document/p1");

  await page
    .locator("div")
    .filter({ hasText: /^DocumentPlain TextThumbnailSearch Results$/ })
    .getByRole("combobox")
    .selectOption("text");

  // check that text view loaded
  await expect(page.locator(".text").first()).toHaveText(/^MARCH 2023/);

  // switch to thumbnail view, click the first image
  await page.getByRole("combobox").selectOption("thumbnail");
  await page.locator("img").first().click();
});
