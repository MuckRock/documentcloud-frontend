import { pageHashUrl } from "../api/documents";

/** Give up re-aligning this long after the initial scroll, in ms. */
const SETTLE_TIMEOUT = 2000;

/** Stop re-aligning once the target has held the same offset for this long. */
const SETTLE_STABLE = 250;

/** Give up waiting for a target that hasn't rendered after this long, in ms. */
const APPEAR_TIMEOUT = 10000;

/** The reader is scrolling, so leave the scroll alone. */
const SCROLL_GESTURES = ["wheel", "touchstart"];

/** Gestures that mean "stop moving the page under me". */
const CANCEL_EVENTS = [...SCROLL_GESTURES, "keydown", "pointerdown"];

/**
 * Scroll to a page using a standard ID
 *
 * @param n page number
 */
export function scrollToPage(n: number): void {
  scrollToId(pageHashUrl(n).replace("#", ""));
}

/**
 * Scroll to the element with this id, waiting for it to render if it hasn't yet.
 *
 * Text mode renders its pages behind a promise, so a deep link into one runs
 * before the target exists — looking it up once and giving up meant text-mode
 * page links never scrolled at all, and switching into text mode kept the old
 * pixel offset and so landed on the wrong page.
 *
 * @param id element id, e.g. `document/p12`
 */
export function scrollToId(id: string): void {
  const find = () => window.document.getElementById(id);

  const el = find();
  if (el) return scrollToElement(el);

  if (typeof MutationObserver !== "function") {
    return console.warn(`Missing scroll target ${id}`);
  }

  const observer = new MutationObserver(() => {
    const el = find();
    if (!el) return;
    stop();
    scrollToElement(el);
  });

  const timer = setTimeout(() => {
    stop();
    console.warn(`Missing scroll target ${id}`);
  }, APPEAR_TIMEOUT);

  function stop() {
    observer.disconnect();
    clearTimeout(timer);
    SCROLL_GESTURES.forEach((event) => window.removeEventListener(event, stop));
  }

  // Only real scrolling calls this off. Content can take seconds to arrive, and
  // a click or keystroke in the meantime doesn't mean the reader gave up on the
  // page they asked for.
  SCROLL_GESTURES.forEach((event) =>
    window.addEventListener(event, stop, { passive: true }),
  );

  observer.observe(window.document.body, { childList: true, subtree: true });
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
function scrollToElement(el: HTMLElement): void {
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
