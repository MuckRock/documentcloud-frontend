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
    const first = document.getElementById("document/p1");
    if (!el || !first) throw new Error(`page ${n} has not rendered`);

    // The viewer scrolls a wrapper around the pages, not the window.
    let scroller = el.parentElement;
    while (scroller && scroller !== document.body) {
      if (/auto|scroll/.test(getComputedStyle(scroller).overflowY)) break;
      scroller = scroller.parentElement;
    }
    const scrollTop =
      scroller?.scrollTop ?? document.scrollingElement?.scrollTop ?? 0;

    // A page plus the gap below it: the distance one page of error covers. Read
    // it off whichever container holds the pages, so this works in text mode
    // (`.textPages`) as well as document mode (`.pages`).
    const gap = parseFloat(getComputedStyle(el.parentElement!).rowGap) || 0;
    const pitch = first.getBoundingClientRect().height + gap;

    return (el.offsetTop - scrollTop) / pitch;
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
    // Sample `.pages` spacing every frame. Any change means pages were laid out
    // at one size and then resized — which moves every page below the change.
    await page.addInitScript(() => {
      const seen: string[] = ((window as any).__spacing = []);
      (function sample() {
        requestAnimationFrame(sample);
        const pages = document.querySelector(".pages");
        if (!pages) return;
        const { paddingLeft, rowGap } = getComputedStyle(pages);
        const spacing = `${paddingLeft}/${rowGap}`;
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
    // narrow spacing (1.5rem padding / 0.75rem gap) must apply immediately.
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
  // Fit-width is the default, and it sizes pages in CSS. A numeric zoom sizes
  // them from the page dimensions instead, which is where the two could — and
  // did — disagree about how big a page is.
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
    // pdf.js only renders pages as they come into view, so at any moment most
    // are still placeholders. If a placeholder is a different size than the
    // rendered article, every page below it moves when pdf.js gets to it.
    await page.goto(`${multiPageDoc.viewerUrl}?zoom=0.5`);
    await expectPdfRendered(page);
    await page.waitForTimeout(SETTLE_MS);

    const sizes = await page.evaluate(() => {
      const distinct = (loaded: boolean) => [
        ...new Set(
          [...document.querySelectorAll<HTMLElement>(".page-container")]
            .filter((c) => (c.dataset.loaded === "true") === loaded)
            .map((c) => {
              const { width, height } = c.getBoundingClientRect();
              return `${Math.round(width)}x${Math.round(height)}`;
            }),
        ),
      ];
      return { rendered: distinct(true), pending: distinct(false) };
    });

    // Every page in the fixture is 595x842, so each group holds one size.
    expect(sizes.rendered, "no page has rendered yet").toHaveLength(1);
    expect(sizes.pending, "every page has already rendered").toHaveLength(1);
    expect(sizes.pending).toEqual(sizes.rendered);
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
