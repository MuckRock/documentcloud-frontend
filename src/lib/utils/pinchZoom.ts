import { flushSync } from "svelte";
import type { Attachment } from "svelte/attachments";

/**
 * Pinch-to-zoom for the PDF viewer surface, supporting both touchscreen
 * two-finger pinches and trackpad pinch gestures.
 *
 * Touch pinches are watched via touchstart/touchmove. The render scale is updated
 * continuously and the document point under the gesture focal point (pinch midpoint
 * or cursor) is held fixed on screen by adjusting the surrounding scroll containers.
 *
 * Anchoring is done with a two-pass measurement against the specific page under
 * the focal point rather than a closed-form formula: pages are centered within
 * the column (see Page.svelte's `align-self: center`) and separated by fixed
 * gaps and headers, so the column doesn't scale uniformly. A single page does,
 * so we record the focal point's offset within it, apply the new scale, then
 * scroll the page's anchor point back under the focal point.
 */

export interface PinchZoomOptions {
  /** Current numeric render scale (e.g. `viewer.scale`). */
  getScale: () => number;
  /**
   * Set the zoom value. Must apply synchronously and flush so the page layout
   * reflects the new scale before we read the post-change geometry.
   */
  setZoom: (scale: number) => void;
  /** Whether pinch-zoom is currently allowed (e.g. only in reading mode). */
  enabled: () => boolean;
  /** Minimum/maximum scale reachable via pinch. */
  min: number;
  max: number;
  /** Called when a pinch gesture begins (touch or trackpad). */
  onPinchStart?: () => void;
  /** Called when a pinch gesture ends. */
  onPinchEnd?: () => void;
}

/** Ignore touch pinches that start with the fingers closer than this (px). */
const MIN_DISTANCE = 8;

function distance(a: Touch, b: Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function midpoint(a: Touch, b: Touch): { x: number; y: number } {
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
}

function isScrollable(value: string): boolean {
  return value === "auto" || value === "scroll";
}

/**
 * Walk up from `el` to find the nearest ancestors that scroll on each axis.
 * The PDF lives inside these containers, so keeping the pinch anchor fixed means
 * adjusting their scroll position as the scale changes.
 */
function findScrollAncestors(el: HTMLElement): {
  horizontal: HTMLElement | null;
  vertical: HTMLElement | null;
} {
  let horizontal: HTMLElement | null = null;
  let vertical: HTMLElement | null = null;
  let node: HTMLElement | null = el.parentElement;
  while (node && (!horizontal || !vertical)) {
    const style = getComputedStyle(node);
    if (!horizontal && isScrollable(style.overflowX)) horizontal = node;
    if (!vertical && isScrollable(style.overflowY)) vertical = node;
    node = node.parentElement;
  }
  return { horizontal, vertical };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Apply a new scale, keeping the document point at (anchorX, anchorY) fixed on screen.
 */
function applyAnchoredZoom(
  element: HTMLElement,
  anchorX: number,
  anchorY: number,
  newScale: number,
  getScale: () => number,
  setZoom: (scale: number) => void,
): void {
  const currentScale = getScale();
  if (currentScale <= 0 || newScale === currentScale) return;
  const k = newScale / currentScale;

  const pageEl = document
    .elementFromPoint(anchorX, anchorY)
    ?.closest(".page-container") as HTMLElement | null;

  // Offset of the focal point within the page, in scaled CSS px (pre-change).
  const rect0 = pageEl?.getBoundingClientRect();
  const px = rect0 ? anchorX - rect0.left : 0;
  const py = rect0 ? anchorY - rect0.top : 0;

  setZoom(newScale);

  // Without a page to anchor against (focal point over a gap/margin), just zoom.
  if (!pageEl || !rect0) return;

  // Flush so page boxes reflow before we measure the post-change geometry
  // and adjust scroll to keep the pinch anchor fixed.
  flushSync();

  // After the layout reflows, scroll so the same document point sits under the
  // focal point. A single page scales uniformly, so the anchor's new offset
  // within it is px/py * k.
  const rect1 = pageEl.getBoundingClientRect();
  const dx = rect1.left + px * k - anchorX;
  const dy = rect1.top + py * k - anchorY;
  const { horizontal, vertical } = findScrollAncestors(element);
  if (horizontal) horizontal.scrollLeft += dx;
  if (vertical) vertical.scrollTop += dy;
}

/**
 * Attach pinch-to-zoom. Handles two-finger touch pinches.
 * Returns a cleanup function that removes the listeners.
 */
export function pinchZoom(options: PinchZoomOptions): Attachment<HTMLElement> {
  return (element) => {
    let active = false;
    let startDistance = 0;
    let startScale = 0;

    function beginPinch(touches: TouchList): boolean {
      if (touches.length !== 2) return false;
      const dist = distance(touches[0]!, touches[1]!);
      if (dist < MIN_DISTANCE) return false;
      active = true;
      startDistance = dist;
      startScale = options.getScale();
      options.onPinchStart?.();
      return true;
    }

    function endPinch(): void {
      if (!active) return;
      active = false;
      startDistance = 0;
      startScale = 0;
      options.onPinchEnd?.();
    }

    function onTouchStart(e: TouchEvent): void {
      if (!options.enabled()) return;
      if (e.touches.length === 2 && beginPinch(e.touches)) {
        // Claim the gesture so the browser doesn't pan while we pinch.
        e.preventDefault();
      }
    }

    function onTouchMove(e: TouchEvent): void {
      if (!options.enabled()) return;
      if (e.touches.length !== 2) {
        if (active) endPinch();
        return;
      }
      // A second finger can land after the first; start once spread is real.
      if (!active && !beginPinch(e.touches)) return;
      e.preventDefault();

      if (!startDistance) return;
      const ratio = distance(e.touches[0]!, e.touches[1]!) / startDistance;
      const newScale = clamp(startScale * ratio, options.min, options.max);
      const { x, y } = midpoint(e.touches[0]!, e.touches[1]!);
      applyAnchoredZoom(
        element,
        x,
        y,
        newScale,
        options.getScale,
        options.setZoom,
      );
    }

    function onTouchEnd(e: TouchEvent): void {
      if (e.touches.length < 2) endPinch();
    }

    element.addEventListener("touchstart", onTouchStart, { passive: false });
    element.addEventListener("touchmove", onTouchMove, { passive: false });
    element.addEventListener("touchend", onTouchEnd, { passive: true });
    element.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchmove", onTouchMove);
      element.removeEventListener("touchend", onTouchEnd);
      element.removeEventListener("touchcancel", onTouchEnd);
    };
  };
}
