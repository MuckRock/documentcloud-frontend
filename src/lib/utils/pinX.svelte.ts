import { getViewerState } from "$lib/state/viewer.svelte";

/**
 * Attachment that handles custom CSS properties for the pin-x class,
 * which pins UI elements horizontally within the PDF viewer.
 */

const PROPERTIES = ["--scroll-range", "--pin-width", "--scroll-left"] as const;

export function pinX(element: HTMLElement) {
  const viewer = getViewerState();

  // Scroll-driven animations: Chrome 115+, Safari 26+, Firefox 144+.
  const animate = CSS.supports("animation-timeline: scroll()");

  function measure(): void {
    const { paddingLeft, paddingRight } = getComputedStyle(element);
    const padding = parseFloat(paddingLeft) + parseFloat(paddingRight);

    element.style.setProperty(
      "--scroll-range",
      `${element.scrollWidth - element.clientWidth}px`,
    );
    element.style.setProperty(
      "--pin-width",
      `${element.clientWidth - padding}px`,
    );
  }

  function onScroll(): void {
    element.style.setProperty("--scroll-left", `${element.scrollLeft}px`);
  }

  $effect(() => {
    void viewer.scale;
    void viewer.pageSizes;

    measure();
  });

  const observer = new ResizeObserver(measure);
  observer.observe(element);

  if (!animate) {
    onScroll();
    element.addEventListener("scroll", onScroll, { passive: true });
  }

  return () => {
    observer.disconnect();
    element.removeEventListener("scroll", onScroll);
    for (const property of PROPERTIES) {
      element.style.removeProperty(property);
    }
  };
}
