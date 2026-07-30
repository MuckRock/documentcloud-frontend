import { pageHashUrl } from "../api/documents";

/** Give up re-aligning this long after the initial scroll, in ms. */
const SETTLE_TIMEOUT = 2000;

/** Stop re-aligning once the target has held the same offset for this long. */
const SETTLE_STABLE = 250;

/** Gestures that mean "stop moving the page under me". */
const CANCEL_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"];

/**
 * Scroll to a page using a standard ID
 *
 * @param n page number
 */
export function scrollToPage(n: number): void {
  const pageId = pageHashUrl(n).replace("#", "");
  const heading = window.document.getElementById(pageId);

  if (!heading) return console.warn(`Missing page ${n}`);
  scrollToElement(heading);
}

/**
 * Scroll an element into view and keep it there while the layout settles.
 *
 * Page geometry is still moving when a deep link scrolls — pdf.js renders pages
 * lazily, fonts and toolbars resolve late — and anything that resizes above the
 * target slides it out of view. So scroll again whenever the target's offset
 * moves, until it holds still or the reader takes over (#1203).
 *
 * @param el the element to scroll to
 */
export function scrollToElement(el: HTMLElement): void {
  el.scrollIntoView();

  // No frames to settle over in a non-visual environment (jsdom, SSR).
  if (typeof requestAnimationFrame !== "function") return;

  const start = performance.now();
  let offset = el.offsetTop;
  let stableSince = start;
  let frame = 0;

  function stop() {
    cancelAnimationFrame(frame);
    CANCEL_EVENTS.forEach((event) => window.removeEventListener(event, stop));
  }

  function tick(now: number) {
    const current = el.offsetTop;

    // `offsetTop` is independent of scroll position, so a change here means the
    // surrounding layout moved the target, not that we scrolled it.
    if (current !== offset) {
      offset = current;
      stableSince = now;
      el.scrollIntoView();
    }

    if (now - stableSince >= SETTLE_STABLE || now - start >= SETTLE_TIMEOUT) {
      return stop();
    }

    frame = requestAnimationFrame(tick);
  }

  // Never fight the reader for control of the scroll.
  CANCEL_EVENTS.forEach((event) =>
    window.addEventListener(event, stop, { passive: true }),
  );

  frame = requestAnimationFrame(tick);
}
