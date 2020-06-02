export function normalizeWheel(/*object*/ event) /*object*/ {
  // Code adapted from https://stackoverflow.com/a/30134826
  // https://github.com/facebookarchive/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js

  // Reasonable defaults
  const DEFAULT_SCALE = 0.2;
  const PIXEL_STEP = 10 * DEFAULT_SCALE;
  const LINE_HEIGHT = 40 * DEFAULT_SCALE;
  const PAGE_HEIGHT = 800 * DEFAULT_SCALE;

  let sX = 0, sY = 0,       // spinX, spinY
    pX = 0, pY = 0;       // pixelX, pixelY

  // Legacy
  if ('detail' in event) { sY = event.detail; }
  if ('wheelDelta' in event) { sY = -event.wheelDelta / 120; }
  if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120; }
  if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120; }

  // side scrolling on FF with DOMMouseScroll
  if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
    sX = sY;
    sY = 0;
  }

  pX = sX * PIXEL_STEP;
  pY = sY * PIXEL_STEP;

  if ('deltaY' in event) { pY = event.deltaY; }
  if ('deltaX' in event) { pX = event.deltaX; }

  if ((pX || pY) && event.deltaMode) {
    if (event.deltaMode == 1) {          // delta in LINE units
      pX *= LINE_HEIGHT;
      pY *= LINE_HEIGHT;
    } else {                             // delta in PAGE units
      pX *= PAGE_HEIGHT;
      pY *= PAGE_HEIGHT;
    }
  }

  return {
    deltaX: pX,
    deltaY: pY
  };
}
