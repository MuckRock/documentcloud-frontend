// @ts-check

import { test, expect } from "@playwright/test";

test.describe("manager tests", () => {
  test("rendering", async ({ page }) => {
    await page.goto("/app");

    const url = new URL(page.url());
    expect(url.pathname).toBe("/app");

    await expect(page).toHaveTitle("DocumentCloud");

    // anonymous message header
    await expect(
      page.getByRole("heading", {
        name: "Welcome to DocumentCloud, an open document archive from MuckRock!",
      }),
    ).toBeVisible();

    // close the overlay
    await page.getByRole("button").nth(3).click();

    // can we see documents?
    await expect(page.locator(".outer > div").first()).toBeVisible();
  });

  test("menus", async ({ page }) => {
    await page.goto("/app");

    // help
    await page.getByText("Help ▼").click();
    await expect(page.getByRole("button", { name: "FAQ" })).toBeVisible();

    // close the menu
    await page.locator(".shim").click();

    // language
    await page.getByText("Language ▼").click();
    await expect(page.getByRole("button", { name: "English ✓" })).toBeVisible();

    await page.locator(".shim").click();
  });
});
