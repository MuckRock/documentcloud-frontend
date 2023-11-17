// @ts-check

import { test, expect } from "@playwright/test";

const DC_BASE = process.env.DC_BASE;

let document, text;

test.describe("document tests", () => {
  // fetch the first available public document as a test case
  test.beforeAll(async () => {
    const endpoint = new URL(
      "api/documents.json?access=public&per_page=1",
      DC_BASE,
    );

    const { results } = await fetch(endpoint)
      .then((r) => r.json())
      .catch(console.error);

    document = results[0];

    console.log(`Using test document: ${document.title}`);

    const textEndpoint = new URL(
      `documents/${document.id}/${document.slug}.txt.json`,
      document.asset_url,
    );

    text = await fetch(textEndpoint)
      .then((r) => r.json())
      .catch((e) => {
        console.error(e);
        console.error(textEndpoint);
      });
  });

  test("basic document test", async ({ page }) => {
    await page.goto(document.canonical_url);

    expect(page.url()).toBe(document.canonical_url);

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
    await expect(page.locator(".text").first()).toHaveText(
      text.pages[0].contents,
    );

    // switch to thumbnail view, click the first image
    await page.getByRole("combobox").selectOption("thumbnail");
    await page.locator("img").first().click();
  });
});
