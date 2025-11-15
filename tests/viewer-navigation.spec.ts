import { test, expect } from "@playwright/test";

/**
 * Viewer Navigation E2E Tests
 *
 * Tests for document viewer navigation, scrolling, and page state management.
 * These tests verify that URL hash navigation (#document/p{N}) correctly
 * scrolls to the target page and maintains consistent state.
 *
 * Uses two Storybook stories:
 * - "Document": 7-page document (document-expanded.json) for basic tests
 * - "Long Document": 129-page document (lefler-thesis.json) for testing navigation to higher page numbers
 */

test.describe("Viewer Navigation - Short Document", () => {
  test.beforeEach(async ({ page }) => {
    // Start on Storybook viewer story with the document-expanded.json fixture (7 pages)
    // Using the iframe URL to directly access the story without Storybook chrome
    await page.goto("http://localhost:6006/iframe.html?id=components-viewer-viewer--document&viewMode=story", {
      waitUntil: "networkidle",
    });

    // Wait for the PDF pages container to be rendered
    await page.waitForSelector(".pages", { timeout: 30000 });
  });

  test("should scroll to correct page on mobile viewport with hash navigation", async ({
    page,
  }) => {
    // Set mobile viewport to trigger the race condition
    await page.setViewportSize({ width: 375, height: 667 });

    // Using page 5 of the 7-page document-expanded.json fixture
    const targetPage = 5;

    // Navigate to a specific page via hash
    await page.goto(
      `http://localhost:6006/iframe.html?id=components-viewer-viewer--document&viewMode=story#document/p${targetPage}`,
      { waitUntil: "networkidle" },
    );

    // Wait for pagination toolbar to be ready, then check the page number
    const paginatorInput = page.locator('input[type="number"]');
    await expect(paginatorInput).toBeVisible();
    await expect(paginatorInput).toHaveValue(targetPage.toString());

    // Verify the target page is actually visible in the viewport by checking for the page header
    const targetPageHeader = page.getByText(`p. ${targetPage}`, { exact: false });
    await expect(targetPageHeader).toBeInViewport({ ratio: 0.1 });
  });

  test("should maintain correct currentPage state after scroll completes", async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Using page 6 of the 7-page document
    const targetPage = 6;

    // Navigate to page 6
    await page.goto(
      `http://localhost:6006/iframe.html?id=components-viewer-viewer--document&viewMode=story#document/p${targetPage}`,
      { waitUntil: "networkidle" },
    );

    // Wait for pagination toolbar to be ready, then verify the page number
    const paginatorInput = page.locator('input[type="number"]');
    await expect(paginatorInput).toBeVisible();
    await expect(paginatorInput).toHaveValue(targetPage.toString());

    // Also verify we can navigate to another page and back
    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(paginatorInput).toHaveValue((targetPage + 1).toString());

    await page.getByRole('button', { name: 'Previous page' }).click();
    await expect(paginatorInput).toHaveValue(targetPage.toString());
  });

  test("should scroll to page 1 correctly on initial load without hash", async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Load without hash - should default to page 1
    await page.goto(
      "http://localhost:6006/iframe.html?id=components-viewer-viewer--document&viewMode=story",
      { waitUntil: "networkidle" },
    );

    // Wait for pagination toolbar and verify page 1
    const paginatorInput = page.locator('input[type="number"]');
    await expect(paginatorInput).toBeVisible();
    await expect(paginatorInput).toHaveValue("1");

    // Verify page 1 is visible by checking for the page header
    const page1Header = page.getByText('p. 1', { exact: false });
    await expect(page1Header).toBeInViewport({ ratio: 0.1 });
  });

  test("should handle navigation to last page of document", async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const targetPage = 7; // Last page of the 7-page document

    await page.goto(
      `http://localhost:6006/iframe.html?id=components-viewer-viewer--document&viewMode=story#document/p${targetPage}`,
      { waitUntil: "networkidle" },
    );

    // Wait for pagination toolbar and verify we're on the last page
    const paginatorInput = page.locator('input[type="number"]');
    await expect(paginatorInput).toBeVisible();
    await expect(paginatorInput).toHaveValue(targetPage.toString());

    // Verify the page is visible by checking for the page header
    const targetPageHeader = page.getByText(`p. ${targetPage}`, { exact: false });
    await expect(targetPageHeader).toBeInViewport({ ratio: 0.1 });
  });

  test("should work correctly on desktop viewport", async ({ page }) => {
    // Set desktop viewport for comparison
    await page.setViewportSize({ width: 1280, height: 720 });

    const targetPage = 5;

    await page.goto(
      `http://localhost:6006/iframe.html?id=components-viewer-viewer--document&viewMode=story#document/p${targetPage}`,
      { waitUntil: "networkidle" },
    );

    // Wait for pagination toolbar and verify pagination state
    const paginatorInput = page.locator('input[type="number"]');
    await expect(paginatorInput).toBeVisible();
    await expect(paginatorInput).toHaveValue(targetPage.toString());

    // Verify page is visible by checking for the page header
    const targetPageHeader = page.getByText(`p. ${targetPage}`, { exact: false });
    await expect(targetPageHeader).toBeInViewport({ ratio: 0.1 });
  });
});

test.describe("Viewer Navigation - Long Document", () => {
  test.beforeEach(async ({ page }) => {
    // Start on Storybook viewer story with the lefler-thesis.json fixture (129 pages)
    await page.goto(
      "http://localhost:6006/iframe.html?id=components-viewer-viewer--long-document&viewMode=story",
      {
        waitUntil: "networkidle",
      },
    );

    // Wait for the PDF pages container to be rendered
    await page.waitForSelector(".pages", { timeout: 30000 });
  });

  test("should scroll to page 32 on mobile viewport with hash navigation", async ({
    page,
  }) => {
    // Set mobile viewport to trigger the race condition
    await page.setViewportSize({ width: 375, height: 667 });

    const targetPage = 32;

    // Navigate to page 32
    await page.goto(
      `http://localhost:6006/iframe.html?id=components-viewer-viewer--long-document&viewMode=story#document/p${targetPage}`,
      { waitUntil: "networkidle" },
    );

    // Wait for pagination toolbar, then check the page number
    // This is the key assertion that should capture the bug:
    // The pagination toolbar should show page 32, not some earlier page
    const paginatorInput = page.locator('input[type="number"]');
    await expect(paginatorInput).toBeVisible();
    await expect(paginatorInput).toHaveValue(targetPage.toString());

    // Verify the target page is actually visible in the viewport by checking for the page header
    const targetPageHeader = page.getByText(`p. ${targetPage}`, { exact: false });
    await expect(targetPageHeader).toBeInViewport({ ratio: 0.1 });
  });

  test("should scroll to page 50 on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const targetPage = 50;

    await page.goto(
      `http://localhost:6006/iframe.html?id=components-viewer-viewer--long-document&viewMode=story#document/p${targetPage}`,
      { waitUntil: "networkidle" },
    );

    // Wait for pagination toolbar and verify the pagination state matches the URL
    const paginatorInput = page.locator('input[type="number"]');
    await expect(paginatorInput).toBeVisible();
    await expect(paginatorInput).toHaveValue(targetPage.toString());

    // Verify the page is visible by checking for the page header
    const targetPageHeader = page.getByText(`p. ${targetPage}`, { exact: false });
    await expect(targetPageHeader).toBeInViewport({ ratio: 0.1 });
  });

  test("should handle navigation to last page (129) on mobile", async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const targetPage = 129; // Last page

    await page.goto(
      `http://localhost:6006/iframe.html?id=components-viewer-viewer--long-document&viewMode=story#document/p${targetPage}`,
      { waitUntil: "networkidle" },
    );

    // Wait for pagination toolbar and verify we're on the last page
    const paginatorInput = page.locator('input[type="number"]');
    await expect(paginatorInput).toBeVisible();
    await expect(paginatorInput).toHaveValue(targetPage.toString());

    // Verify the page is visible by checking for the page header
    const targetPageHeader = page.getByText(`p. ${targetPage}`, { exact: false });
    await expect(targetPageHeader).toBeInViewport({ ratio: 0.1 });
  });

  test("should navigate via sections menu to page 45", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(
      "http://localhost:6006/iframe.html?id=components-viewer-viewer--long-document&viewMode=story",
      { waitUntil: "networkidle" },
    );

    // Click on the Sections dropdown (has "Recurring Syntax Structures" section at page 45)
    await page.locator('text=Sections').click();

    // Click on "5. Recurring Syntax Structures" which is at page 45 (use menuitem role to avoid the heading)
    await page.getByRole('menuitem', { name: '5. Recurring Syntax Structures' }).click();

    // Wait for pagination toolbar and verify we navigated to page 46 (page_number 45 is 0-indexed, so page 46)
    const paginatorInput = page.locator('input[type="number"]');
    await expect(paginatorInput).toBeVisible();
    await expect(paginatorInput).toHaveValue("46"); // page_number 45 + 1

    // Verify the page is visible by checking for the page header
    const targetPageHeader = page.getByText('p. 46', { exact: false });
    await expect(targetPageHeader).toBeInViewport({ ratio: 0.1 });
  });
});
