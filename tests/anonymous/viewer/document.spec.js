// @ts-check
import fs from "node:fs/promises";
import { test as base, expect } from "@playwright/test";

const { NODE_ENV = "development" } = process.env;

const test = base.extend({
  document: async ({ page }, use) => {
    const filename = new URL(
      `../../fixtures/${NODE_ENV}.json`,
      import.meta.url,
    );

    const documents = await fs
      .readFile(filename)
      .then((s) => JSON.parse(s.toString()));

    await use(documents[0]);
  },
});

test.describe("document tests", () => {
  test("basic document test", async ({ page, document }) => {
    // canonical will point to a URL that might not exist on staging
    const path = new URL(document.canonical_url).pathname;
    await page.goto(path).catch(console.error);

    expect(new URL(page.url()).pathname).toBe(path);

    await expect(page.locator(".sidebar").getByRole("heading")).toHaveText(
      document.title,
    );

    await page.getByRole("link", { name: "Original Document (PDF) »" }).click();

    await expect(page.locator("h1")).toHaveText(document.title);

    await page.getByRole("link", { name: "p. 1" }).click();

    expect(new URL(page.url()).hash).toEqual("#document/p1");

    await page
      .locator("div")
      .filter({ hasText: /^DocumentPlain TextThumbnailSearch Results$/ })
      .getByRole("combobox")
      .selectOption("text");

    // check that text view loaded
    await expect(page.locator(".text").first()).toBeVisible();

    // switch to thumbnail view, click the first image
    await page.getByRole("combobox").selectOption("thumbnail");
    await page.locator("img").first().click();
  });
});
