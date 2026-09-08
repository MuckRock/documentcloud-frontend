import { test, expect, type Page } from "@playwright/test";

// Coverage for infinite scroll on the document list (#927): scrolling the
// `InfiniteScrollTrigger` into view should append another page of results via
// `SearchResultsState.loadNext`, using the same cursor the search API hands
// back — not re-run the initial query.

const PER_PAGE = 3;

// Use small viewport to ensure the document list overflows
test.use({ viewport: { width: 900, height: 500 } });

/**
 * `GuidedTour` auto-starts a driver.js walkthrough for logged-in users on
 * first visit to `/documents/` (see `onboarding/scripts.ts`), and its overlay
 * would swallow the scroll gestures this test depends on. Mark it as already
 * seen before the app boots, using the same `StorageManager` key format
 * (`__documentcloud_<key>_<subkey>`) the app itself writes.
 */
async function suppressGuidedTour(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "__documentcloud_guided-tour_tours",
      JSON.stringify({ "/(app)/documents": false }),
    );
  });
}

/** Rows currently rendered by `ResultsList`. */
function resultRows(page: Page) {
  return page.locator(".result-row");
}

test("infinite scroll loads multiple pages of search results", async ({
  page,
}) => {
  await suppressGuidedTour(page);

  // Capture the initial search response to learn the corpus size before
  // committing to a multi-page scroll test.
  const initialSearch = page.waitForResponse((r) =>
    r.url().includes("/api/documents/search/"),
  );
  await page.goto(`/documents/?q=&per_page=${PER_PAGE}`);
  const initialResponse = await initialSearch;
  const { count } = await initialResponse.json();

  // Need enough documents for at least two loadNext calls beyond the first
  // page. A dedicated low-volume test account may not have this - skip with a
  // clear reason rather than let the scroll loop hang.
  test.skip(
    count < PER_PAGE * 3,
    `test account has only ${count} documents; need at least ${PER_PAGE * 3} for a multi-page infinite scroll test`,
  );

  // Track every search request's cursor param, to prove pagination reuses
  // the API's `next` cursor rather than re-querying from scratch.
  const cursors: string[] = [];
  page.on("request", (req) => {
    if (!req.url().includes("/api/documents/search/")) return;
    const cursor = new URL(req.url()).searchParams.get("cursor");
    if (cursor) cursors.push(cursor);
  });

  // The observer is wired up by an `{@attach}` on mount, so a scroll issued
  // before hydration is a no-op. Wait for the first page of rows to be
  // visible as the hydration signal.
  await expect(resultRows(page).first()).toBeVisible({ timeout: 15_000 });

  const trigger = page.getByTestId("scroll-trigger");
  const loadMoreButton = page.getByRole("button", { name: "Load more" });

  async function loadNextPage() {
    const before = await resultRows(page).count();

    await expect(async () => {
      // A single failed request flips InfiniteScrollTrigger's `auto` flag
      // to false, so it stops retrying on scroll and falls back to a manual
      // "Load more" button instead (see InfiniteScrollTrigger.svelte).
      if (await loadMoreButton.isVisible()) {
        await loadMoreButton.click();
      } else {
        await trigger.scrollIntoViewIfNeeded();
      }
      await expect
        .poll(() => resultRows(page).count(), { timeout: 3_000 })
        .toBeGreaterThan(before);
    }).toPass({ timeout: 20_000 });
  }

  // Scroll twice, confirming growth and no duplicate rows each time. Rows
  // from earlier rounds stay on the page (loadNext appends, it doesn't
  // replace), so check the whole current list is duplicate-free each time
  // rather than tracking "new" titles across rounds.
  for (let round = 0; round < 2; round++) {
    await loadNextPage();

    const links = resultRows(page).locator("h3.title a.title-link");
    const hrefs = await links.evaluateAll((els) =>
      els.map((el) => el.getAttribute("href")),
    );

    expect(hrefs, "every row should link to a document").not.toContain(null);
    expect(
      new Set(hrefs).size,
      `duplicate document rows after round ${round}`,
    ).toBe(hrefs.length);
  }

  // Pagination went through the search API's cursor, not a fresh q= query.
  expect(cursors.length).toBeGreaterThanOrEqual(2);
  expect(new Set(cursors).size).toBe(cursors.length);

  // The footer count tracks what's actually rendered.
  const rowCount = await resultRows(page).count();
  await expect(page.getByText(`Showing ${rowCount}`)).toBeVisible();
});
