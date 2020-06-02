import { Svue } from 'svue';
import { identity, compose, translate, scale, toCSS, applyToPoint, inverse } from 'transformation-matrix';
import { closeEnough } from '@/util/epsilon';
import { cubicInOut } from 'svelte/easing';
import { doc } from './document';

const DEFAULT_VIEWPORT = [500, 500];

const MAX_ZOOM = 8; // 8x
const MIN_ZOOM = 1 / 5;

const ZOOM_TO_PADDING = 20;

const FLY_FN = cubicInOut;
const DEFAULT_FLY_SECONDS = 1;

// Bouncing off eddge
const BOUNCE_STEP = 30;
const BOUNCE_LERP = 0.1;
const SCROLL_DISCOUNT = 0.5;

function copyMatrix(matrix) {
  return { a: matrix.a, b: matrix.b, c: matrix.c, d: matrix.d, e: matrix.e, f: matrix.f };
}

function lerp(t, a, b) {
  return a + t * (b - a);
}

function matrixCloseEnough(a, b) {
  return closeEnough(a.a, b.a) &&
    closeEnough(a.b, b.b) &&
    closeEnough(a.c, b.c) &&
    closeEnough(a.d, b.d) &&
    closeEnough(a.e, b.e) &&
    closeEnough(a.f, b.f);
}

function interpMatrix(t, a, b) {
  return {
    a: lerp(t, a.a, b.a),
    b: lerp(t, a.b, b.b),
    c: lerp(t, a.c, b.c),
    d: lerp(t, a.d, b.d),
    e: lerp(t, a.e, b.e),
    f: lerp(t, a.f, b.f),
  }
}

export class Transform extends Svue {
  constructor(document, data = {}, computed = {}) {
    super({
      data() {
        return {
          document,
          matrix: compose(identity()),
          flyParams: { transforming: false },
          bounceParams: { bouncing: false },
          scrollParams: { lastScroll: null, lastScrollTime: null },
          speed: { dx: 0, dx: 0 },
          viewportSize: DEFAULT_VIEWPORT,
          ...data,
        }
      },
      computed: {
        xBounds(document) {
          return [document.layout.rail - document.layout.pageBoundsWhenZoomed, document.layout.rail + document.layout.pageWidth + document.layout.pageBoundsWhenZoomed];
        },
        yBounds(document) {
          return [0, document.containerHeight];
        },
        width(xBounds) {
          return xBounds[1] - xBounds[0];
        },
        height(yBounds) {
          return yBounds[1] - yBounds[0];
        },
        viewportBounds(viewportSize, inverseMatrix) {
          const topLeft = applyToPoint(inverseMatrix, [0, 0]);
          const bottomRight = applyToPoint(inverseMatrix, viewportSize);
          return [...topLeft, ...bottomRight];
        },
        viewportWidth(viewportBounds) {
          return viewportBounds[2] - viewportBounds[0];
        },
        viewportHeight(viewportBounds) {
          return viewportBounds[3] - viewportBounds[1];
        },
        scaleFactor(matrix) {
          // See https://math.stackexchange.com/a/417813
          return matrix.a;
        },
        cssMatrix(matrix) {
          return toCSS(matrix);
        },
        inverseMatrix(matrix) {
          return inverse(matrix);
        },
        visiblePages(matrix, document, viewportSize) {
          return document.pages.filter(page => {
            const position = page.position;
            const [x1, y1] = applyToPoint(matrix, [position[0], position[1]]);
            const [x2, y2] = applyToPoint(matrix, [position[2], position[3]]);

            if (x2 < 0 || y2 < 0) return false;
            if (x1 > viewportSize[0] || y1 > viewportSize[1]) return false;
            return true;
          });
        },
        ...computed,
      }
    });

    this.translate(this.viewportSize[0] / 2, this.viewportSize[1] / 2);
  }

  ensureBounds() {
    const [x1, y1, x2, y2] = this.viewportBounds;

    let dx = 0;
    let dy = 0;
    let forceDx = false;

    const currentWidth = x2 - x1;
    if (currentWidth > this.document.layout.pageWidth) {
      // Center page when zoomed out
      const currentCenter = x1 + (x2 - x1) / 2;
      const desiredCenter = this.document.containerWidth / 2;
      dx = currentCenter - desiredCenter;
      forceDx = true;
    } else {
      // Prevent panning past page + rail
      if (x1 < this.xBounds[0]) {
        dx = x1 - this.xBounds[0];
      } else if (x2 > this.xBounds[1]) {
        dx = x2 - this.xBounds[1];
      }
    }

    const currentHeight = y2 - y1;
    if (currentHeight > this.height) {
      // Stay on top of page if zoomed out too far
      dy = y1 - this.yBounds[0];
    } else {
      // Prevent panning past page bounds
      if (y1 < this.yBounds[0]) {
        dy = y1 - this.yBounds[0];
      } else if (y2 > this.yBounds[1]) {
        dy = y2 - this.yBounds[1];
      }
    }

    if (!closeEnough(dx, 0) || !closeEnough(dy, 0)) {
      this.translate(dx, dy);
    }
    // if (forceDx) {
    //   this.matrix = compose(this.matrix, translate(dx, 0));
    //   dx = 0;
    // }

    // if (!closeEnough(dx, 0) || !closeEnough(dy, 0)) {
    //   const desiredMatrix = compose(this.matrix, translate(dx, dy));
    //   if (this.bounceParams.desiredMatrix != null) {
    //     this.bounceParams.desiredMatrix = desiredMatrix;
    //   } else {
    //     this.bounceParams = {
    //       desiredMatrix,
    //       lastTimestamp: null
    //     };
    //     requestAnimationFrame(ts => this.bounce(ts));
    //   }
    // } else {
    //   this.bounceParams = {};
    // }
  }

  bounce(ts) {
    if (this.bounceParams.desiredMatrix != null) {
      if (this.bounceParams.lastTimestamp == null) {
        this.bounceParams.lastTimestamp = ts;
        return requestAnimationFrame(ts => this.bounce(ts));
      }
      const deltaTime = ts - this.bounceParams.lastTimestamp;

      for (let i = 0; i < deltaTime / BOUNCE_STEP; i++) {
        this.matrix = interpMatrix(BOUNCE_LERP, this.matrix, this.bounceParams.desiredMatrix);
      }

      if (matrixCloseEnough(this.matrix, this.bounceParams.desiredMatrix)) {
        this.bounceParams = {};
      }

      this.bounceParams.lastTimestamp = ts;
      return requestAnimationFrame(ts => this.bounce(ts));
    }
  }

  translate(dx, dy, scaled = false, isScroll = false) {
    this.stopFly();

    if (scaled) {
      dx /= this.scaleFactor;
      dy /= this.scaleFactor;
    }
    const newMatrix = compose(this.matrix, translate(dx, dy));

    if (isScroll && this.bounceParams.desiredMatrix != null) {
      // Temper scroll based on bouncing
      this.matrix = interpMatrix(SCROLL_DISCOUNT, this.matrix, newMatrix);
    } else {
      this.matrix = newMatrix;
    }
    this.ensureBounds();
  }

  scale(cx, cy, factor) {
    this.stopFly();

    if (this.scaleFactor * factor < MIN_ZOOM) {
      factor = MIN_ZOOM / this.scaleFactor;
    } else if (this.scaleFactor * factor > MAX_ZOOM) {
      factor = MAX_ZOOM / this.scaleFactor;
    }

    const [dx, dy] = this.unproject([cx, cy]);
    this.matrix = compose(this.matrix, translate(dx, dy), scale(factor, factor), translate(-dx, -dy));
    this.ensureBounds();
  }

  updateViewport(width, height, center = false) {
    if (center) {
      this.translate(-this.viewportSize[0] / 2, -this.viewportSize[1] / 2);
    }
    this.viewportSize = [width, height];
    if (center) {
      this.translate(this.viewportSize[0] / 2, this.viewportSize[1] / 2);
    }
  }

  zoomToPage(scene) {
    this.fly(this.fitTransform(scene.center, scene.width + ZOOM_TO_PADDING, scene.height + ZOOM_TO_PADDING));
  }

  simulateFly(ts) {
    if (this.flyParams.transforming) {
      if (this.flyParams.startTime != null) {
        const dt = ts - this.flyParams.startTime;
        let x = dt / this.flyParams.duration / 1000;
        let done = false;
        if (x > 1) {
          x = 1;
          done = true;
        }
        const t = FLY_FN(x);
        this.matrix = interpMatrix(t, this.flyParams.prevMatrix, this.flyParams.desiredMatrix);

        if (done) return this.stopFly();
      } else {
        this.flyParams.startTime = ts;
      }

      // Request to move again
      window.requestAnimationFrame(ts => this.simulateFly(ts));
    } else {
      return this.stopFly();
    }
  }

  stopFly(includeMoratium = true) {
    this.flyParams = {
      transforming: false,
      scrollMoratium: includeMoratium ? this.flyParams.scrollMoratium : null
    };
  }

  fly(matrix, seconds = DEFAULT_FLY_SECONDS) {
    const wasTransforming = this.flyParams.transforming;
    this.flyParams = {
      duration: seconds,
      startTime: null,
      prevMatrix: copyMatrix(this.matrix),
      desiredMatrix: matrix,
      transforming: true,
    };
    if (!wasTransforming) {
      // Start flying unless animation is already running
      requestAnimationFrame(ts => this.simulateFly(ts));
    }
  }

  fitPercents(left, top, right, bottom) {
    const x1 = left * this.width;
    const x2 = right * this.width;
    const y1 = top * this.height;
    const y2 = bottom * this.height;
    const width = x2 - x1;
    const height = y2 - y1;
    return this.fitTransform([x1 + width / 2, y1 + height / 2], width, height);
  }

  fitTransform(centerPoint, width, height) {
    // Return a matrix that encompasses the desired center point and encompasses the width/height
    const vw = this.viewportSize[0];
    const vh = this.viewportSize[1];
    const scaleFactor = Math.min(vw / width, vh / height);
    return compose(identity(), translate(vw / 2, vh / 2), scale(scaleFactor), translate(-centerPoint[0], -centerPoint[1]));
  }

  project(point) {
    return applyToPoint(this.matrix, point);
  }

  unproject(point) {
    return applyToPoint(this.inverseMatrix, point);
  }
}

export const transform = new Transform(doc);
