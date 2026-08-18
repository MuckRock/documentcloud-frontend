/**
 * Unit tests for the pinchZoom attachment.
 *
 * jsdom lacks TouchEvent, so tests synthesise touch events by attaching a
 * `touches` array to a plain Event. The `flushSync` import from "svelte" is
 * mocked so the anchored-zoom path can be exercised without a real component
 * tree, and `document.elementFromPoint` / `getBoundingClientRect` are stubbed
 * where the scroll-anchoring math needs controlled geometry.
 */
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from "vitest";

const { flushSync } = vi.hoisted(() => ({ flushSync: vi.fn() }));
vi.mock("svelte", () => ({ flushSync }));

import { pinchZoom, type PinchZoomOptions } from "../pinchZoom";

// --- touch-event helpers ---

/** A Touch-like object with just the coordinates pinchZoom reads. */
function touch(x: number, y: number): Touch {
  return { clientX: x, clientY: y } as Touch;
}

/** Two touches `dist` px apart, centred at (cx, cy). */
function twoTouches(cx: number, cy: number, dist: number): Touch[] {
  return [touch(cx - dist / 2, cy), touch(cx + dist / 2, cy)];
}

/** Dispatch a synthetic touch event with the given touches. */
function fireTouch(el: HTMLElement, type: string, touches: Touch[]): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", {
    value: touches,
    configurable: true,
  });
  el.dispatchEvent(event);
  return event;
}

// --- setup helper ---

function setup(overrides: Partial<PinchZoomOptions> = {}) {
  let scale = 1;
  const setZoom = vi.fn((s: number) => {
    scale = s;
  });
  const onPinchStart = vi.fn();
  const onPinchEnd = vi.fn();

  const options: PinchZoomOptions = {
    getScale: () => scale,
    setZoom,
    enabled: () => true,
    min: 0.4,
    max: 2.5,
    onPinchStart,
    onPinchEnd,
    ...overrides,
  };

  const element = document.createElement("div");
  document.body.appendChild(element);
  const cleanup = pinchZoom(options)(element) as () => void;

  return {
    element,
    cleanup,
    setZoom,
    onPinchStart,
    onPinchEnd,
    getScale: () => scale,
    setScale: (s: number) => {
      scale = s;
    },
  };
}

describe("pinchZoom", () => {
  beforeAll(() => {
    // jsdom has no layout engine, so elementFromPoint is not implemented.
    // Stub it to return null by default; individual tests override as needed.
    document.elementFromPoint = vi.fn(() => null);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    document.elementFromPoint = vi.fn(() => null);
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  describe("gesture lifecycle", () => {
    it("starts a pinch on a two-finger touchstart", () => {
      const { element, onPinchStart } = setup();
      fireTouch(element, "touchstart", twoTouches(200, 200, 100));
      expect(onPinchStart).toHaveBeenCalledTimes(1);
    });

    it("calls preventDefault on touchstart to claim the gesture", () => {
      const { element } = setup();
      const event = fireTouch(element, "touchstart", twoTouches(200, 200, 100));
      expect(event.defaultPrevented).toBe(true);
    });

    it("does not start a pinch when disabled", () => {
      const { element, onPinchStart } = setup({ enabled: () => false });
      fireTouch(element, "touchstart", twoTouches(200, 200, 100));
      expect(onPinchStart).not.toHaveBeenCalled();
    });

    it("does not start a pinch when fingers are closer than the minimum distance", () => {
      const { element, onPinchStart } = setup();
      // 4 px apart — below the 8 px MIN_DISTANCE threshold
      fireTouch(element, "touchstart", twoTouches(200, 200, 4));
      expect(onPinchStart).not.toHaveBeenCalled();
    });

    it("does not call preventDefault when the pinch is rejected", () => {
      const { element } = setup();
      const event = fireTouch(element, "touchstart", twoTouches(200, 200, 4));
      expect(event.defaultPrevented).toBe(false);
    });

    it("can start a pinch on touchmove if the second finger lands late", () => {
      const { element, onPinchStart, setZoom } = setup();

      // touchstart with one finger — no pinch yet
      fireTouch(element, "touchstart", [touch(150, 200)]);
      expect(onPinchStart).not.toHaveBeenCalled();

      // second finger arrives in touchmove — pinch begins
      fireTouch(element, "touchmove", twoTouches(200, 200, 100));
      expect(onPinchStart).toHaveBeenCalledTimes(1);

      // first move has ratio 1 (start distance == move distance), no zoom yet
      expect(setZoom).not.toHaveBeenCalled();

      // spread to 200 px → ratio 2 → zoom to 2×
      fireTouch(element, "touchmove", twoTouches(200, 200, 200));
      expect(setZoom).toHaveBeenCalledWith(2);
    });

    it("zooms in when the pinch spreads apart", () => {
      const { element, setZoom } = setup();
      fireTouch(element, "touchstart", twoTouches(200, 200, 100));
      fireTouch(element, "touchmove", twoTouches(200, 200, 200));
      expect(setZoom).toHaveBeenCalledWith(2);
    });

    it("zooms out when the pinch closes in", () => {
      const { element, setZoom } = setup();
      fireTouch(element, "touchstart", twoTouches(200, 200, 200));
      fireTouch(element, "touchmove", twoTouches(200, 200, 100));
      expect(setZoom).toHaveBeenCalledWith(0.5);
    });

    it("clamps the scale to the configured minimum", () => {
      const { element, setZoom } = setup({ min: 0.4 });
      fireTouch(element, "touchstart", twoTouches(200, 200, 200));
      // pinch way in — ratio 0.1 → raw scale 0.1, clamped to 0.4
      fireTouch(element, "touchmove", twoTouches(200, 200, 20));
      expect(setZoom).toHaveBeenCalledWith(0.4);
    });

    it("clamps the scale to the configured maximum", () => {
      const { element, setZoom } = setup({ max: 2.5 });
      fireTouch(element, "touchstart", twoTouches(200, 200, 100));
      // pinch way out — ratio 10 → raw scale 10, clamped to 2.5
      fireTouch(element, "touchmove", twoTouches(200, 200, 1000));
      expect(setZoom).toHaveBeenCalledWith(2.5);
    });

    it("does not zoom when only one finger remains mid-pinch", () => {
      const { element, setZoom, onPinchEnd } = setup();
      fireTouch(element, "touchstart", twoTouches(200, 200, 100));
      fireTouch(element, "touchmove", [touch(200, 200)]);
      expect(setZoom).not.toHaveBeenCalled();
      expect(onPinchEnd).toHaveBeenCalledTimes(1);
    });

    it("calls preventDefault on touchmove during an active pinch", () => {
      const { element } = setup();
      fireTouch(element, "touchstart", twoTouches(200, 200, 100));
      const event = fireTouch(element, "touchmove", twoTouches(200, 200, 200));
      expect(event.defaultPrevented).toBe(true);
    });

    it("fires onPinchEnd on touchend", () => {
      const { element, onPinchEnd } = setup();
      fireTouch(element, "touchstart", twoTouches(200, 200, 100));
      fireTouch(element, "touchend", [touch(200, 200)]);
      expect(onPinchEnd).toHaveBeenCalledTimes(1);
    });

    it("fires onPinchEnd on touchcancel", () => {
      const { element, onPinchEnd } = setup();
      fireTouch(element, "touchstart", twoTouches(200, 200, 100));
      fireTouch(element, "touchcancel", [touch(200, 200)]);
      expect(onPinchEnd).toHaveBeenCalledTimes(1);
    });

    it("removes all listeners after cleanup", () => {
      const { element, cleanup, onPinchStart } = setup();
      cleanup();
      fireTouch(element, "touchstart", twoTouches(200, 200, 100));
      expect(onPinchStart).not.toHaveBeenCalled();
    });
  });

  describe("anchored zoom", () => {
    let element: HTMLElement;
    let scrollH: HTMLElement;
    let scrollV: HTMLElement;
    let pageEl: HTMLElement;

    beforeEach(() => {
      // Build a scroll-container hierarchy so findScrollAncestors has something
      // to adjust: scrollH (overflow-x) > scrollV (overflow-y) > element
      scrollH = document.createElement("div");
      scrollH.style.overflowX = "auto";
      scrollH.style.overflowY = "hidden";

      scrollV = document.createElement("div");
      scrollV.style.overflowX = "visible";
      scrollV.style.overflowY = "auto";

      element = document.createElement("div");
      scrollV.appendChild(element);
      scrollH.appendChild(scrollV);
      document.body.appendChild(scrollH);

      // A page element that elementFromPoint will "find" under the focal point
      pageEl = document.createElement("div");
      pageEl.className = "page-container";
      document.body.appendChild(pageEl);

      document.elementFromPoint = vi.fn(() => pageEl);
    });

    it("adjusts scroll ancestors to keep the focal point fixed", () => {
      let scale = 1;
      const setZoom = vi.fn((s: number) => {
        scale = s;
      });

      // Page at (150, 180). After zoom the top-left stays put but the box
      // doubles in size (the surrounding layout would reflow; we simulate the
      // post-reflow rect by reading `scale` inside the mock).
      pageEl.getBoundingClientRect = vi.fn(
        () =>
          ({
            left: 150,
            top: 180,
            right: 150 + 100 * scale,
            bottom: 180 + 100 * scale,
            width: 100 * scale,
            height: 100 * scale,
            x: 150,
            y: 180,
            toJSON: () => ({}),
          }) as DOMRect,
      );

      const cleanup = pinchZoom({
        getScale: () => scale,
        setZoom,
        enabled: () => true,
        min: 0.4,
        max: 2.5,
      })(element) as () => void;

      // Start pinch: touches 100 px apart, centred at (200, 200)
      fireTouch(element, "touchstart", twoTouches(200, 200, 100));

      // Move: touches 200 px apart → ratio 2, newScale 2, midpoint (200, 200)
      fireTouch(element, "touchmove", twoTouches(200, 200, 200));

      expect(setZoom).toHaveBeenCalledWith(2);
      // flushSync is called between the pre- and post-zoom measurements
      expect(flushSync).toHaveBeenCalled();

      // dx = rect1.left + px * k - anchorX = 150 + 50 * 2 - 200 = 50
      // dy = rect1.top  + py * k - anchorY = 180 + 20 * 2 - 200 = 20
      expect(scrollH.scrollLeft).toBe(50);
      expect(scrollV.scrollTop).toBe(20);

      cleanup();
    });

    it("zooms without scroll adjustment when the focal point is over a gap", () => {
      // elementFromPoint returns an element without a .page-container ancestor
      const gapEl = document.createElement("div");
      document.body.appendChild(gapEl);
      document.elementFromPoint = vi.fn(() => gapEl);

      let scale = 1;
      const setZoom = vi.fn((s: number) => {
        scale = s;
      });

      const cleanup = pinchZoom({
        getScale: () => scale,
        setZoom,
        enabled: () => true,
        min: 0.4,
        max: 2.5,
      })(element) as () => void;

      fireTouch(element, "touchstart", twoTouches(200, 200, 100));
      fireTouch(element, "touchmove", twoTouches(200, 200, 200));

      expect(setZoom).toHaveBeenCalledWith(2);
      // No page element → no flushSync, no scroll adjustment
      expect(flushSync).not.toHaveBeenCalled();
      expect(scrollH.scrollLeft).toBe(0);
      expect(scrollV.scrollTop).toBe(0);

      cleanup();
    });

    it("does nothing when the new scale equals the current scale", () => {
      const setZoom = vi.fn();

      const cleanup = pinchZoom({
        getScale: () => 1,
        setZoom,
        enabled: () => true,
        min: 0.4,
        max: 2.5,
      })(element) as () => void;

      // Start and move with the same distance → ratio 1, newScale === currentScale
      fireTouch(element, "touchstart", twoTouches(200, 200, 100));
      fireTouch(element, "touchmove", twoTouches(200, 200, 100));

      expect(setZoom).not.toHaveBeenCalled();

      cleanup();
    });
  });
});
