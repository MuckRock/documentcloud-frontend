import { vi } from "vitest";

interface ViewportSize {
  width?: number;
  height?: number;
  /** Height every virtualized item reports once mounted. */
  itemHeight?: number;
}

/**
 * Replace ResizeObserver with one that reports the scroll container as
 * `width` x `height` and each item as `itemHeight` tall, so virtua mounts
 * only the items that fit, as it would in a browser.
 *
 * jsdom has no layout, so without this the viewport measures 0x0 and a
 * virtualized list renders no items. virtua ignores item sizes from elements
 * without an `offsetParent`, which jsdom never sets, so that is stubbed too.
 */
export function stubViewport({
  width = 1024,
  height = 768,
  itemHeight = 200,
}: ViewportSize = {}) {
  vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(
    function (this: HTMLElement) {
      return this.parentElement;
    },
  );

  vi.stubGlobal(
    "ResizeObserver",
    class {
      #callback: ResizeObserverCallback;
      // virtua observes its scroll container before any item.
      #viewport?: Element;

      constructor(callback: ResizeObserverCallback) {
        this.#callback = callback;
      }

      observe(target: Element) {
        this.#viewport ??= target;
        const contentRect =
          target === this.#viewport
            ? { width, height }
            : { width, height: itemHeight };
        queueMicrotask(() =>
          this.#callback(
            [{ target, contentRect } as ResizeObserverEntry],
            this as unknown as ResizeObserver,
          ),
        );
      }

      unobserve() {}
      disconnect() {}
    },
  );
}
