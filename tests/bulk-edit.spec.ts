import type { Locator, Page } from "@playwright/test";

import { test, expect } from "./helpers/fixtures";

// Nothing here saves, so the shared `multiPageDoc` is never modified.

// Tall enough that a drop target in the second row isn't near the scroll
// container's edge, which would auto-scroll the grid under the pointer.
test.use({ viewport: { width: 1280, height: 1600 } });

const slot = (page: Page, n: number) =>
  page.locator(`[id="document/p${n}"] img`);

/** Which source page each of the first `count` grid slots shows. */
function sourcePages(page: Page, count: number): Promise<number[]> {
  return Promise.all(
    Array.from({ length: count }, async (_, i) => {
      const src = (await slot(page, i + 1).getAttribute("src")) ?? "";
      return Number(src.match(/-p(\d+)-/)?.[1]);
    }),
  );
}

/** The rotation each of the first `count` grid slots is drawn at. */
function rotations(page: Page, count: number): Promise<string[]> {
  return Promise.all(
    Array.from({ length: count }, (_, i) =>
      slot(page, i + 1).evaluate((img) =>
        img
          .closest<HTMLElement>(".page-container")!
          .style.getPropertyValue("--rotation"),
      ),
    ),
  );
}

const checkbox = (page: Page, n: number) =>
  page.getByLabel(`Select page ${n}`, { exact: true });

async function center(locator: Locator) {
  const box = (await locator.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function drag(page: Page, from: number, to: number) {
  const start = await center(slot(page, from));
  const end = await center(slot(page, to));
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 20 });
  await page.mouse.up();

  // The drop animation leaves a clone of the dragged page in the grid.
  await expect(page.locator("[data-dnd-dragging]")).toHaveCount(0);
}

test.beforeEach(async ({ page, multiPageDoc }) => {
  await page.goto(`${multiPageDoc.viewerUrl}?mode=bulk`);
  // The first visit after the shared document finishes processing is slow.
  await expect(slot(page, 4)).toBeVisible({ timeout: 30_000 });
});

test("drags the selected pages after the page they are dropped on", async ({
  page,
}) => {
  await slot(page, 1).click();
  await slot(page, 2).click({ modifiers: ["Shift"] });
  await expect(checkbox(page, 2)).toBeChecked();

  await drag(page, 1, 4);

  await expect.poll(() => sourcePages(page, 5)).toEqual([3, 4, 1, 2, 5]);
});

test("drags an unselected page on its own, replacing the selection", async ({
  page,
}) => {
  await slot(page, 3).click();

  await drag(page, 1, 2);

  await expect.poll(() => sourcePages(page, 3)).toEqual([2, 1, 3]);
  await expect(checkbox(page, 3)).not.toBeChecked();
});

test("deletes the selected pages from the grid", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));

  await slot(page, 1).click();
  await slot(page, 2).click({ modifiers: ["Shift"] });
  await page.getByLabel("Delete", { exact: true }).click();

  await expect.poll(() => sourcePages(page, 3)).toEqual([3, 4, 5]);
  await expect(checkbox(page, 1)).not.toBeChecked();
  expect(errors).toEqual([]);
});

test("rotates the selected pages clockwise", async ({ page }) => {
  await slot(page, 1).click();
  await slot(page, 2).click({ modifiers: ["Shift"] });
  await page.getByLabel("Rotate clockwise", { exact: true }).click();

  await expect
    .poll(() => rotations(page, 3))
    .toEqual(["90deg", "90deg", "0deg"]);
});

test("rotates the selected pages counterclockwise", async ({ page }) => {
  await slot(page, 2).click();
  await page.getByLabel("Rotate counterclockwise", { exact: true }).click();

  await expect
    .poll(() => rotations(page, 3))
    .toEqual(["0deg", "-90deg", "0deg"]);
});

test("duplicates the selected pages after the last one selected", async ({
  page,
}) => {
  await slot(page, 1).click();
  await slot(page, 3).click();
  await page.getByLabel("Duplicate", { exact: true }).click();

  await expect.poll(() => sourcePages(page, 6)).toEqual([1, 2, 3, 1, 3, 4]);
});

test("selects and deselects every page from the toolbar", async ({
  page,
  multiPageDoc,
}) => {
  const selectAll = page.getByLabel("Select All", { exact: true });

  await page.getByText("Select All", { exact: true }).click();

  await expect(
    page.getByText(`${multiPageDoc.pageCount} Selected`),
  ).toBeVisible();
  await expect(checkbox(page, 1)).toBeChecked();
  await expect(checkbox(page, 4)).toBeChecked();

  await page.getByText(`${multiPageDoc.pageCount} Selected`).click();

  await expect(selectAll).not.toBeChecked();
  await expect(checkbox(page, 1)).not.toBeChecked();
});

test("undoes the last edit", async ({ page }) => {
  await slot(page, 1).click();
  await page.getByLabel("Rotate clockwise", { exact: true }).click();
  await slot(page, 1).click();
  await slot(page, 2).click();
  await page.getByLabel("Delete", { exact: true }).click();
  await expect.poll(() => sourcePages(page, 2)).toEqual([1, 3]);

  await page.getByRole("button", { name: "Undo" }).click();

  await expect.poll(() => sourcePages(page, 3)).toEqual([1, 2, 3]);
  await expect
    .poll(() => rotations(page, 3))
    .toEqual(["90deg", "0deg", "0deg"]);
});

test("selects a page from the keyboard", async ({ page }) => {
  const box = checkbox(page, 1);

  await box.focus();
  await expect(box).toBeFocused();
  await page.keyboard.press("Space");

  await expect(box).toBeChecked();
});
