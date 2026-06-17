import { test, expect, type Page } from "@playwright/test";

// Regression coverage for #1312: date-range searches must reach Solr as a
// working filter. Two things are required and both regressed before:
//   1. Bare YYYY-MM-DD bounds need `T00:00:00Z` / `T23:59:59Z` time suffixes.
//   2. The colons in those timestamps must be escaped (`T00\:00\:00Z`) or Solr
//      silently drops the whole range clause and returns every document.
// These run logged out against the public document list, which renders the
// same search editor.

/** Read the current `q` search param from the page URL. */
function currentQuery(page: Page): string {
  return new URL(page.url()).searchParams.get("q") ?? "";
}

/** Open the search editor on the document list and focus it. */
async function focusSearchEditor(page: Page) {
  await page.goto("/documents/");
  // ProseMirror mounts its contenteditable as a `.ProseMirror` child, but only
  // after the page hydrates and the document list finishes loading. That can
  // take well over the default 5s on a cold start (especially headed), so give
  // the mount explicit headroom.
  const editor = page.locator(".prosemirror-editor .ProseMirror");
  await expect(editor).toBeVisible({ timeout: 15_000 });
  await editor.click();
  return editor;
}

/** Type a field name and press Enter to drop into its range builder. */
async function openRangeBuilder(page: Page, field: string) {
  const editor = page.locator(".prosemirror-editor .ProseMirror");
  // pressSequentially focuses and dispatches real keystrokes, which the
  // autocomplete plugin needs to detect the field trigger.
  await editor.pressSequentially(field);
  // The field-suggestion dropdown should appear with the typed field.
  await expect(page.locator(".search-autocomplete")).toBeVisible();
  // Enter selects the highlighted field suggestion and enters the range stage.
  await page.keyboard.press("Enter");
  await expect(page.locator(".search-ac-range")).toBeVisible();
}

test("custom date range builder produces an escaped, filtering query", async ({
  page,
}) => {
  await focusSearchEditor(page);
  await openRangeBuilder(page, "created_at");

  // An impossible past range: a working filter returns zero documents, while a
  // dropped clause (the bug) returns the entire public corpus.
  const builder = page.locator(".search-ac-range");
  await builder.locator('input[id$="-start"]').fill("1900-01-01");
  await builder.locator('input[id$="-end"]').fill("1900-12-31");

  // Capture the search API call the auto-submit triggers. Match on the
  // `created_at` field so we don't accidentally grab the document list's
  // initial empty-`q` load search, which can fire late on a cold start.
  const searchResponse = page.waitForResponse(
    (r) =>
      r.url().includes("/api/documents/search/?") &&
      r.url().includes("created_at"),
  );

  // The range section's Insert button is the second one in the dropdown.
  await builder.locator(".search-ac-insert-btn").nth(1).click();

  // Colons must be escaped in the serialized query.
  await page.waitForURL((url) =>
    (url.searchParams.get("q") ?? "").includes("created_at:["),
  );
  expect(currentQuery(page)).toContain(
    "created_at:[1900-01-01T00\\:00\\:00Z TO 1900-12-31T23\\:59\\:59Z]",
  );

  // And Solr actually applies the filter: nothing exists in 1900.
  const resp = await searchResponse;
  expect(resp.status()).toBe(200);
  const body = await resp.json();
  expect(decodeURIComponent(resp.url())).toContain("1900-01-01T00\\:00\\:00Z");
  expect(body.count).toBe(0);
});

test("fixed single day becomes an escaped, day-spanning range", async ({
  page,
}) => {
  await focusSearchEditor(page);
  await openRangeBuilder(page, "created_at");

  const builder = page.locator(".search-ac-range");
  await builder.locator('input[id$="-fixed"]').fill("2024-06-15");

  // The Fixed section's Insert button is the first one in the dropdown.
  await builder.locator(".search-ac-insert-btn").nth(0).click();

  await page.waitForURL((url) =>
    (url.searchParams.get("q") ?? "").includes("created_at:["),
  );
  // A single day must span the whole day (not match only midnight UTC), with
  // escaped colons.
  expect(currentQuery(page)).toContain(
    "created_at:[2024-06-15T00\\:00\\:00Z TO 2024-06-15T23\\:59\\:59Z]",
  );
});

test("a bare-date range loaded from the URL is normalized on submit", async ({
  page,
}) => {
  // Simulates a pasted query or saved search with bare dates (the original
  // report). The editor deserializes it, and re-submitting must emit escaped
  // timestamps.
  await page.goto("/documents/?q=created_at:[2024-01-01 TO 2024-01-31]");

  const editor = page.locator(".prosemirror-editor");
  await expect(editor).toBeVisible();
  // The deserialized range renders as an atom inside the editor.
  await expect(editor.getByText(/created_at/)).toBeVisible();

  await editor.click();
  await page.keyboard.press("Enter");

  await page.waitForURL((url) =>
    (url.searchParams.get("q") ?? "").includes("T00\\:00\\:00Z"),
  );
  expect(currentQuery(page)).toContain(
    "created_at:[2024-01-01T00\\:00\\:00Z TO 2024-01-31T23\\:59\\:59Z]",
  );
});
