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
    await page.locator("button.dismiss").click();

    // can we see documents?
    await expect(page.locator(".outer > div").first()).toBeVisible();
  });

  test("menus", async ({ page }) => {
    await page.goto("/app");

    // help
    await page.getByText("Help", { exact: true }).dispatchEvent("click");
    await expect(page.getByRole("button", { name: "FAQ" })).toBeVisible();

    // close the menu
    await page.locator(".overlay").click();

    // language
    await page.getByText("Language", { exact: true }).dispatchEvent("click");
    await expect(page.getByRole("button", { name: "Español" })).toBeVisible();

    await page.locator(".overlay").click();
  });

  test("documents", async ({ page }) => {
    await page.goto("/app");

    // close the overlay
    await page.locator("button.dismiss").click();

    await page.getByRole("button", { name: "Open" }).first().click();

    await expect(page.locator("h1")).toBeVisible();
    await page.goBack();

    // close the overlay again
    await page.locator("button.dismiss").click();

    await page.getByRole("main").getByRole("link").nth(1).click();
    await page.getByRole("banner").getByRole("link").click();
  });
});
