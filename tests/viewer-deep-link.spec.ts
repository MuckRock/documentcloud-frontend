import type { Page } from "@playwright/test";

import { test, expect } from "./helpers/fixtures";
import { expectPdfRendered } from "./helpers/documents";

// Regression coverage for #1203: opening `…/#document/pN` must come to rest on
// page N. The viewer scrolls once, while pages are still being laid out, so
// anything that resizes above the target leaves the reader short of it. Two of
// these cases assert that outcome; the other two guard its causes directly,
// since the outcome only breaks under unlucky timing.
//
// A phone is where the error is largest relative to a page, so most run at one.
const PHONE = { width: 390, height: 844 };

/** Deep enough into the document that a per-page error compounds visibly. */
const target = (pageCount: number) => pageCount - 2;

/**
 * The settle window in `scrollToElement`, plus margin. These tests assert where
 * the viewer *came to rest*, so they have to outlast it; polling until aligned
 * would paper over the bug being tested.
 */
const SETTLE_MS = 2_500;

/**
 * How far the target sits from the top of the scroll viewport, in pages. ~0 is
 * where the reader asked to be; 3 is three pages short of it. Signed, so an
 * overshoot is caught too.
 */
function pagesOffTarget(page: Page, n: number): Promise<number> {
  return page.evaluate((n) => {
    const el = document.getElementById(`document/p${n}`);
    if (!el) throw new Error(`page ${n} has not rendered`);

    // The viewer scrolls a wrapper around the pages, not the window.
    let scroller = el.parentElement;
    while (scroller && scroller !== document.body) {
      if (/auto|scroll/.test(getComputedStyle(scroller).overflowY)) break;
      scroller = scroller.parentElement;
    }

    // Distance from the scroller's top edge to the target — the same shape as
    // `scrollToElement`'s `getOffset` in src/lib/utils/scroll.ts. Rects are
    // already scroll-position-relative, so this needs no separate scrollTop
    // term, and `scroller` being null (window scroll) falls back to the
    // viewport's own top edge (0), which is exactly right for that case too.
    const scrollerTop =
      scroller && scroller !== document.body
        ? scroller.getBoundingClientRect().top
        : 0;
    const offset = el.getBoundingClientRect().top - scrollerTop;

    // A page plus the gap below it: the distance one page of error covers.
    // Measured from the target and a mounted neighbor.
    const neighbor =
      document.getElementById(`document/p${n - 1}`) ??
      document.getElementById(`document/p${n + 1}`);
    const pitch = neighbor
      ? Math.abs(
          el.getBoundingClientRect().top - neighbor.getBoundingClientRect().top,
        )
      : el.getBoundingClientRect().height;

    return offset / pitch;
  }, n);
}

/** Open the viewer at a page anchor and wait for it to finish settling. */
async function openAtPage(page: Page, viewerUrl: string, n: number) {
  await page.goto(`${viewerUrl}#document/p${n}`);
  await expectPdfRendered(page);
  await page.waitForTimeout(SETTLE_MS);
}

/** Assert the viewer came to rest on page `n`. */
async function expectAlignedTo(page: Page, n: number) {
  const off = await pagesOffTarget(page, n);
  expect(
    Math.abs(off),
    `page ${n} came to rest ${off.toFixed(2)} pages from the top of the viewer`,
  ).toBeLessThan(0.25);
}

test.describe("deep linking to a page", () => {
  test.use({ viewport: PHONE });

  test("lands on the requested page", async ({ page, multiPageDoc }) => {
    const n = target(multiPageDoc.pageCount);
    await openAtPage(page, multiPageDoc.viewerUrl, n);

    await expectAlignedTo(page, n);

    // And the viewer agrees with itself about where the reader is.
    await expect(page.locator('input[type="number"]').first()).toHaveValue(
      String(n),
    );
  });

  test("lays pages out at their final spacing on the first paint", async ({
    page,
    multiPageDoc,
  }) => {
    // Sample the page spacing every frame. Any change means pages were laid out
    // at one size and then resized — which moves every page below the change.
    // Padding is on the scroll container (`.pages`); spacing between pages is
    // `margin-bottom` on the item wrapper (`.page-wrapper`).
    await page.addInitScript(() => {
      const seen: string[] = ((window as any).__spacing = []);
      (function sample() {
        requestAnimationFrame(sample);
        const pages = document.querySelector(".pages");
        // `.last` drops margin-bottom to 0, so exclude it — otherwise which
        // page virtua happens to have mounted first could flip the sample.
        const item = pages?.querySelector(".page-wrapper:not(.last)");
        if (!pages || !item) return;
        const { paddingLeft } = getComputedStyle(pages);
        const { marginBottom } = getComputedStyle(item);
        const spacing = `${paddingLeft}/${marginBottom}`;
        if (seen.at(-1) !== spacing) seen.push(spacing);
      })();
    });

    await openAtPage(
      page,
      multiPageDoc.viewerUrl,
      target(multiPageDoc.pageCount),
    );

    const spacing: string[] = await page.evaluate(
      () => (window as any).__spacing,
    );

    expect(spacing, "page spacing should never be re-laid out").toHaveLength(1);
    // On a phone the viewer is unambiguously in the narrow bucket, so the
    // narrow spacing (1.5rem padding / 0.75rem margin-bottom) must apply
    // immediately.
    expect(spacing[0]).toBe("24px/12px");
  });

  test("re-aligns when the layout shifts after the scroll", async ({
    page,
    multiPageDoc,
  }) => {
    // Stand in for a real late shift (a lazily rendered page, a font, a toolbar)
    // with one big enough to be unambiguous: 40px per page moves the target
    // about a page down. It hangs off the viewer's own scroll rather than a
    // fixed delay because Chrome keeps re-scrolling to the URL fragment while
    // the document loads, quietly absorbing anything that lands before it.
    await page.addInitScript(() => {
      const scrollIntoView = Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView = function (...args) {
        Element.prototype.scrollIntoView = scrollIntoView; // first scroll only
        setTimeout(() => {
          const style = document.createElement("style");
          style.textContent = ".page { padding-top: 40px !important; }";
          document.head.appendChild(style);
        }, 200);
        return scrollIntoView.apply(this, args);
      };
    });

    const n = target(multiPageDoc.pageCount);
    await openAtPage(page, multiPageDoc.viewerUrl, n);

    await expectAlignedTo(page, n);
  });
});

test.describe("deep linking on a wide screen", () => {
  // The sidebars mount after the first paint, which genuinely narrows the
  // viewer and re-picks its spacing. Chrome's own fragment scroll usually
  // papers over the resulting drift here, which is why #1203 read as
  // mobile-only — assert it directly so the viewer doesn't rely on that.
  test.use({ viewport: { width: 1280, height: 900 } });

  test("lands on the requested page", async ({ page, multiPageDoc }) => {
    const n = target(multiPageDoc.pageCount);
    await openAtPage(page, multiPageDoc.viewerUrl, n);

    await expectAlignedTo(page, n);
  });
});

test.describe("deep linking at a numeric zoom", () => {
  // "auto" is the default: the viewer measures its own width and derives one
  // scale for the whole document. An explicit `?zoom=` pins that scale instead,
  // so these cover the other side of the branch that sizes a page.
  test.use({ viewport: { width: 1280, height: 900 } });

  for (const zoom of ["0.5", "2"]) {
    test(`lands on the requested page at zoom ${zoom}`, async ({
      page,
      multiPageDoc,
    }) => {
      const n = target(multiPageDoc.pageCount);

      await page.goto(`${multiPageDoc.viewerUrl}?zoom=${zoom}#document/p${n}`);
      await expectPdfRendered(page);
      await page.waitForTimeout(SETTLE_MS);

      await expectAlignedTo(page, n);
    });
  }

  test("sizes a page the same whether or not it has rendered", async ({
    page,
    multiPageDoc,
  }) => {
    // pdf.js swaps a page's placeholder box for its rendered canvas
    // asynchronously (`data-loaded` flips true in PDFPage.svelte). If the
    // placeholder and rendered sizes disagree, every page below it moves when
    // pdf.js gets to it. Track one page's own box across that transition.
    await page.addInitScript(() => {
      const result: { before?: string; after?: string } = ((
        window as any
      ).__pageSizeTransition = {});
      let tracked: HTMLElement | null = null;
      const key = (el: HTMLElement) => {
        const { width, height } = el.getBoundingClientRect();
        return `${Math.round(width)}x${Math.round(height)}`;
      };
      (function sample() {
        requestAnimationFrame(sample);
        if (!tracked) {
          tracked = document.querySelector<HTMLElement>(".page-container");
          if (!tracked) return;
          result.before = key(tracked);
        }
        if (tracked.dataset.loaded === "true" && !result.after) {
          result.after = key(tracked);
        }
      })();
    });

    await page.goto(`${multiPageDoc.viewerUrl}?zoom=0.5`);
    await expectPdfRendered(page);
    await page.waitForTimeout(SETTLE_MS);

    const { before, after } = await page.evaluate(
      () => (window as any).__pageSizeTransition,
    );
    expect(
      before,
      "a page should have been seen before it rendered",
    ).toBeTruthy();
    expect(
      after,
      "the tracked page should have finished rendering",
    ).toBeTruthy();
    expect(after).toBe(before);
  });
});

test.describe("deep linking into text mode", () => {
  // Text mode renders its pages behind a promise, so the target doesn't exist
  // when the deep link fires. Wider than the other cases on purpose: a
  // logged-in reading toolbar has more buttons, and below ~1440 it collapses
  // the mode switcher into a dropdown whose links aren't clickable.
  test.use({ viewport: { width: 1440, height: 900 } });

  /** Text pages render as `<pre>` blocks once the text response arrives. */
  const textRendered = (page: Page) =>
    expect(page.locator("pre").first()).toBeVisible({ timeout: 30_000 });

  /**
   * A mode tab, by href. Their accessible name isn't the visible label (the
   * octicon inside contributes to it), so `getByRole` doesn't find them, and the
   * collapsed dropdown holds a hidden copy of each — hence `:visible`.
   */
  const modeTab = (page: Page, mode: string) =>
    page.locator(`a[href*="mode=${mode}"]:visible`).first();

  test("lands on the requested page", async ({ page, multiPageDoc }) => {
    const n = target(multiPageDoc.pageCount);

    await page.goto(`${multiPageDoc.viewerUrl}?mode=text#document/p${n}`);
    await textRendered(page);
    await page.waitForTimeout(SETTLE_MS);

    await expectAlignedTo(page, n);
  });

  test("switching modes keeps your place", async ({ page, multiPageDoc }) => {
    // Three loads, each waiting out the settle window.
    test.setTimeout(120_000);

    const n = target(multiPageDoc.pageCount);
    await openAtPage(page, multiPageDoc.viewerUrl, n);
    await expectAlignedTo(page, n);

    // Mode links carry no page hash, so holding your place is up to the mode
    // that mounts. Keeping the raw pixel offset isn't enough: text pages are a
    // different height than PDF pages, so it lands on a different page.
    await modeTab(page, "text").click();
    await textRendered(page);
    await page.waitForTimeout(SETTLE_MS);
    await expectAlignedTo(page, n);

    await modeTab(page, "document").click();
    await expectPdfRendered(page);
    await page.waitForTimeout(SETTLE_MS);
    await expectAlignedTo(page, n);
  });
});
