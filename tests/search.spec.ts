import { test, expect, type Page } from "@playwright/test";

// Coverage for the document list's `ResultsList`:
//
// - Infinite scroll (#927): scrolling the `InfiniteScrollTrigger` into view
//   should append another page of results via `SearchResultsState.loadNext`,
//   using the same cursor the search API hands back — not re-run the initial
//   query.
// - Virtualization (#1424): rows are rendered through virtua's `Virtualizer`,
//   so only the rows near the viewport are mounted. The DOM row count is no
//   longer the number of loaded results — read that off the footer's
//   "Showing N" count instead — and selection has to live in
//   `SearchResultsState`, not in the checkboxes, so it survives a row
//   unmounting.

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

/**
 * Load the document list and return the corpus size. Waits for the first row
 * to be visible: the scroll observer and the checkbox handlers are wired up
 * on mount, so interacting before hydration is a no-op.
 *
 * The size is read off the footer ("Showing N of M"), not the search
 * response: SvelteKit can replay the initial search from the SSR payload, so
 * the browser doesn't always request it.
 */
async function openDocumentList(page: Page, perPage: number) {
  await suppressGuidedTour(page);
  await page.goto(`/documents/?q=&per_page=${perPage}`);

  const firstRow = resultRows(page).first();
  const noResults = page.getByRole("heading", { name: "No search results" });
  await expect(firstRow.or(noResults)).toBeVisible({ timeout: 15_000 });
  if (await noResults.isVisible()) return 0;

  const counts = await resultsCount(page);
  // Without a total the footer only has what's loaded, which is a floor.
  return counts.total ?? counts.loaded;
}

/** The footer's results count: loaded into `SearchResultsState`, and total. */
async function resultsCount(page: Page) {
  const footer = page.getByText(/^Showing [\d,]+/).first();
  await expect(footer).toBeVisible();
  const text = (await footer.textContent()) ?? "";
  const match = text.match(/Showing ([\d,]+)(?: of ([\d,]+))?/);
  if (!match?.[1]) throw new Error(`no results count in footer: "${text}"`);
  const toNumber = (s: string) => Number(s.replace(/,/g, ""));
  return {
    loaded: toNumber(match[1]),
    total: match[2] ? toNumber(match[2]) : undefined,
  };
}

/** Rows currently mounted by `ResultsList`'s virtualizer. */
function resultRows(page: Page) {
  return page.locator(".result-row");
}

/** The document link in each mounted row, in DOM order. */
function rowHrefs(page: Page) {
  return resultRows(page)
    .locator("h3.title a.title-link")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
}

/** A mounted row, found by the document it links to. */
function rowFor(page: Page, href: string) {
  return resultRows(page).filter({
    has: page.locator(`h3.title a.title-link[href="${href}"]`),
  });
}

/** Results loaded into `SearchResultsState`. */
async function loadedCount(page: Page) {
  return (await resultsCount(page)).loaded;
}

/**
 * Scroll `DocumentBrowser`'s scroll container (the virtualizer's `scrollRef`)
 * to a fraction of its scrollable height. It's the nearest scrollable
 * ancestor of the rows; the window itself doesn't scroll.
 */
async function scrollResultsTo(page: Page, fraction: number) {
  await resultRows(page)
    .first()
    .evaluate((row, fraction) => {
      let el = row.parentElement;
      while (el && !/(auto|scroll)/.test(getComputedStyle(el).overflowY)) {
        el = el.parentElement;
      }
      if (!el) throw new Error("no scroll container above the results list");
      el.scrollTop = (el.scrollHeight - el.clientHeight) * fraction;
    }, fraction);
}

test("infinite scroll loads multiple pages of search results", async ({
  page,
}) => {
  // Track every search request's cursor param, to prove pagination reuses
  // the API's `next` cursor rather than re-querying from scratch.
  const cursors: string[] = [];
  page.on("request", (req) => {
    if (!req.url().includes("/api/documents/search/")) return;
    const cursor = new URL(req.url()).searchParams.get("cursor");
    if (cursor) cursors.push(cursor);
  });

  const count = await openDocumentList(page, PER_PAGE);

  // Need enough documents for at least two loadNext calls beyond the first
  // page. A dedicated low-volume test account may not have this - skip with a
  // clear reason rather than let the scroll loop hang.
  test.skip(
    count < PER_PAGE * 3,
    `test account has only ${count} documents; need at least ${PER_PAGE * 3} for a multi-page infinite scroll test`,
  );

  const trigger = page.getByTestId("scroll-trigger");
  const loadMoreButton = page.getByRole("button", { name: "Load more" });

  async function loadNextPage() {
    const before = await loadedCount(page);

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
        .poll(() => loadedCount(page), { timeout: 3_000 })
        .toBeGreaterThan(before);
    }).toPass({ timeout: 20_000 });
  }

  // Scroll twice, confirming growth and no duplicate rows each time. Only the
  // rows near the viewport are mounted, so the duplicate check covers that
  // window, not every loaded result.
  for (let round = 0; round < 2; round++) {
    await loadNextPage();

    const hrefs = await rowHrefs(page);

    expect(hrefs, "every row should link to a document").not.toContain(null);
    expect(
      new Set(hrefs).size,
      `duplicate document rows after round ${round}`,
    ).toBe(hrefs.length);
  }

  // Pagination went through the search API's cursor, not a fresh q= query.
  expect(cursors.length).toBeGreaterThanOrEqual(2);
  expect(new Set(cursors).size).toBe(cursors.length);

  // The virtualizer never mounts more rows than were loaded.
  expect(await resultRows(page).count()).toBeLessThanOrEqual(
    await loadedCount(page),
  );
});

test.describe("virtualized results list", () => {
  // One page big enough that the list is several viewports tall, so rows
  // well above or below the viewport get unmounted.
  const VIRTUAL_PER_PAGE = 25;
  const MIN_DOCS = 15;

  test.beforeEach(async ({ page }) => {
    const count = await openDocumentList(page, VIRTUAL_PER_PAGE);
    test.skip(
      count < MIN_DOCS,
      `test account has only ${count} documents; need at least ${MIN_DOCS} to overflow the viewport enough to virtualize`,
    );
  });

  test("mounts only the rows near the viewport", async ({ page }) => {
    const loaded = await loadedCount(page);
    const [firstHref] = await rowHrefs(page);

    // Fewer rows are mounted than were loaded.
    expect(await resultRows(page).count()).toBeLessThan(loaded);

    // Scrolling swaps the mounted window: the first row unmounts and later
    // rows mount in its place.
    await scrollResultsTo(page, 0.5);
    await expect(rowFor(page, firstHref!)).toHaveCount(0);
    await expect(resultRows(page).first()).toBeVisible();

    // Scrolling back remounts it.
    await scrollResultsTo(page, 0);
    await expect(rowFor(page, firstHref!)).toBeVisible();
  });

  test("keeps a selection when its row unmounts and remounts", async ({
    page,
  }) => {
    const [firstHref] = await rowHrefs(page);
    const row = rowFor(page, firstHref!);
    const checkbox = row.getByRole("checkbox");

    await checkbox.check();
    await expect(row).toHaveClass(/selected/);

    // Scroll the selected row out of the mounted window.
    await scrollResultsTo(page, 0.5);
    await expect(row).toHaveCount(0);
    await expect(page.locator("label.select-all")).toHaveText(/1\s+Selected/);

    // It comes back still selected.
    await scrollResultsTo(page, 0);
    await expect(checkbox).toBeChecked();
    await expect(row).toHaveClass(/selected/);
  });

  test("select all selects rows that aren't mounted", async ({ page }) => {
    const loaded = await loadedCount(page);

    await page.locator("label.select-all").getByRole("checkbox").check();

    // Every loaded result is selected, not just the mounted rows.
    await expect(page.locator("label.select-all")).toHaveText(
      new RegExp(`${loaded}\\s+Selected`),
    );
    await expect(resultRows(page).getByRole("checkbox").first()).toBeChecked();

    // Rows that mount after scrolling come up checked.
    await scrollResultsTo(page, 0.5);
    const checkboxes = resultRows(page).getByRole("checkbox");
    await expect(checkboxes.first()).toBeVisible();
    for (const c of await checkboxes.all()) {
      await expect(c).toBeChecked();
    }
  });
});
