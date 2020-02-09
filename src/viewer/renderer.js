import { Svue } from "svue";
import { viewer } from "./viewer";
import { layout, annotationValid } from "./layout";
import { withinPercent } from "@/util/epsilon";
import { tick } from "svelte";

const DEFAULT_ASPECT = 11 / 8.5; // letter size paper
const DEFAULT_VISIBLE_OFFSET = -60; // offset at which to start next page number

export const renderer = new Svue({
  data() {
    return {
      imageAspects: [],
      textAspects: [],
      mode: "image",
      width: 800,
      pageRail: 69,
      verticalPageMargin: 6,
      baseVerticalDocumentMargin: 18,
      annotationDocumentMargin: 60,
      bodyHeight: 0,
      top: 0,
      elem: null,
      defaultAspect: DEFAULT_ASPECT,
      visibleOffset: DEFAULT_VISIBLE_OFFSET,
      viewer,
      layout,
      blockScrollEvent: false
    };
  },
  watch: {
    viewer(viewer) {
      if (viewer.pageAspects != null) initAspects();
    }
  },
  computed: {
    annotationDialogOpen(layout) {
      return layout.displayAnnotate;
    },
    verticalDocumentMargin(
      baseVerticalDocumentMargin,
      annotationDocumentMargin,
      annotationDialogOpen
    ) {
      return (
        baseVerticalDocumentMargin +
        (annotationDialogOpen ? annotationDocumentMargin : 0)
      );
    },
    aspects(mode, imageAspects, textAspects) {
      if (mode == "image") return imageAspects;
      if (mode == "text") return textAspects;
      throw new Error("Invalid mode");
    },
    fullPageWidth(width, pageRail) {
      return width + pageRail * 2;
    },
    bottom(top, bodyHeight) {
      return top + bodyHeight;
    },
    loaded(viewer) {
      return viewer.loaded;
    },
    pageCount(aspects) {
      return aspects.length;
    },
    averageAspect(aspects) {
      let sum = 0;
      let count = 0;
      for (let i = 0; i < aspects.length; i++) {
        const aspect = aspects[i].aspect;
        if (aspect != null) {
          sum += aspect;
          count++;
        }
      }
      if (count != 0) return sum / count;
      return this.defaultAspect;
    },
    computedAspects(aspects, averageAspect) {
      return aspects.map(aspect => ({
        ...aspect,
        aspect: aspect.aspect == null ? averageAspect : aspect.aspect
      }));
    },
    heights(width, verticalPageMargin, computedAspects) {
      return computedAspects.map(aspect =>
        heightOfAspect(aspect.aspect, width, verticalPageMargin)
      );
    },
    currentPageNumber(
      heights,
      top,
      verticalPageMargin,
      verticalDocumentMargin
    ) {
      let offset = verticalDocumentMargin + verticalPageMargin;
      for (let i = 0; i < heights.length; i++) {
        if (offset >= top) return i;
        offset += heights[i];
      }
      return heights.length - 1; // return last page if nothing matched
    },
    visiblePageNumber(
      heights,
      top,
      verticalPageMargin,
      verticalDocumentMargin,
      visibleOffset
    ) {
      let offset = verticalDocumentMargin + verticalPageMargin + visibleOffset;
      for (let i = 0; i < heights.length; i++) {
        if (offset >= top) return i;
        offset += heights[i];
      }
      return heights.length; // return last page if nothing matched
    },
    pagesAboveTheFold(elementsToShow, top) {
      return elementsToShow
        .filter(e => e.type == "page" && e.top < top)
        .map(x => x.number);
    },
    elementsToShow(heights, verticalDocumentMargin, top, bottom) {
      if (heights.length == 0) return [];

      let totalHeight = verticalDocumentMargin;
      let chunks = [];

      let firstPageEncountered = false;
      let lastPageOffset = null;

      for (let i = 0; i < heights.length; i++) {
        const height = heights[i];

        if (!firstPageEncountered && totalHeight + height > top) {
          // First page encountered
          chunks.push({
            type: "space",
            height: totalHeight
          });
          firstPageEncountered = true;
        }
        if (totalHeight + height > top && totalHeight <= bottom) {
          // Page is visible
          chunks.push({
            type: "page",
            top: totalHeight,
            number: i
          });
          lastPageOffset = totalHeight + height;
        }

        totalHeight += height;
      }

      // Add document margin at the bottom.
      totalHeight += verticalDocumentMargin;

      // Place final gap
      const offset = totalHeight - lastPageOffset;
      if (offset != 0) {
        chunks.push({
          type: "space",
          height: offset
        });
      }

      return chunks;
    },
    aspectRuns(computedAspects) {
      // Helper methods
      const freshAspect = (start = 0) => ({
        total: 0,
        count: 0,
        start,
        skipStartPageNumber: false
      });

      const addRun = end => {
        // Skip empty runs
        if (end == currentRun.start) return;

        // Add to the page objects and reset the run
        pageObjects.push({ type: "pages", end, ...currentRun });
        currentRun = freshAspect(end);
      };

      // Initialize objects
      let pageObjects = [];
      let currentRun = freshAspect();

      let i;
      for (i = 0; i < computedAspects.length; i++) {
        const { aspect, note } = computedAspects[i];
        let skipStartPageNumber = false;

        if (note != null) {
          addRun(i);
          pageObjects.push({ type: "note", note, page: i });
          // Don't show the first page in a run of notes
          skipStartPageNumber = true;
        }

        if (skipStartPageNumber) {
          currentRun.skipStartPageNumber = true;
          skipStartPageNumber = false;
        }
        currentRun.total += aspect;
        currentRun.count++;
      }
      addRun(i);

      return pageObjects;
    },
    overallHeight(
      computedAspects,
      width,
      verticalDocumentMargin,
      verticalPageMargin
    ) {
      let sum = verticalDocumentMargin * 2;
      for (let i = 0; i < computedAspects.length; i++) {
        const aspect = computedAspects[i].aspect;
        const height = width * aspect;
        sum += height + verticalPageMargin * 2;
      }
      return sum;
    }
  }
});

function initAspects() {
  renderer.imageAspects = viewer.pageAspects.map(aspect => ({ aspect }));
  renderer.textAspects = viewer.pageAspects.map(_ => ({ aspect: null }));
}

function heightOfAspect(aspect, width, verticalPageMargin) {
  return width * aspect + verticalPageMargin * 2;
}

export function setAspect(pageNumber, aspect) {
  const existingInfo = renderer.aspects[pageNumber];

  // Don't trigger updates on same aspect
  if (withinPercent(existingInfo.aspect, aspect, 0.0001)) return 0;

  // Tabulate previous heights before page we're updating
  let prevHeights = 0;
  const currentPageNumber = renderer.currentPageNumber;
  for (let i = 0; i < currentPageNumber; i++) {
    prevHeights += renderer.heights[i];
  }

  if (renderer.mode == "image") {
    renderer.imageAspects[pageNumber] = { ...existingInfo, aspect };
    renderer.imageAspects = renderer.aspects;
  } else if (renderer.mode == "text") {
    renderer.textAspects[pageNumber] = { ...existingInfo, aspect };
    renderer.textAspects = renderer.aspects;
  } else throw new Error("Invalid mode");

  // Tabulate current heights before page we're updating
  let currentHeights = 0;
  for (let i = 0; i < currentPageNumber; i++) {
    currentHeights += renderer.heights[i];
  }

  // Return an offset to scroll to accommodate page jumps above the fold.
  return currentHeights - prevHeights;
}

/**
 * Scrolls the renderer to the desired position.
 * @param {number} pos The absolute scroll position to set.
 */
export async function scroll(pos) {
  // Fix bounds
  const maxPos = renderer.overallHeight - renderer.bodyHeight;
  if (pos > maxPos) pos = maxPos;
  if (pos < 0) pos = 0;

  renderer.top = pos;
  // Let DOM updates sink in before updating scroll top
  await tick();
  renderer.blockScrollEvent = true;
  renderer.elem.scrollTop = pos;

  return pos;
}

export async function scrollOffset(offset) {
  scroll(renderer.elem.scrollTop + offset);
}

export function getPosition() {
  // Like getting current page number, but rounds to page before
  const heights = renderer.heights;
  const top = renderer.top;

  let totalHeight = renderer.verticalDocumentMargin;
  for (let i = 0; i < heights.length; i++) {
    totalHeight += heights[i];
    if (totalHeight >= top + 1) {
      return i;
    }
  }
}

export async function restorePosition(pos) {
  // Scroll to a desired page number.
  const heights = renderer.heights;

  let totalHeight = renderer.verticalDocumentMargin;
  for (let i = 0; i < pos; i++) {
    totalHeight += heights[i];
  }
  await scroll(totalHeight);
}

export function changeMode(mode) {
  // No effect when mode is same
  if (mode == renderer.mode) return;

  // Change the mode while preserving position.
  const position = getPosition();

  renderer.mode = mode;

  restorePosition(position);

  // Deselect any text
  if (window.getSelection) window.getSelection().removeAllRanges();
}

export async function scrollVisibleAnnotationIntoView() {
  await tick();
  const elem = layout.displayedAnnotationElem;
  // Scroll into view if possible
  if (elem != null && elem.scrollIntoView) {
    elem.scrollIntoView();
    // Scroll a little above
    scrollOffset(-30);
  }
}

export async function showAnnotation(annotation, scrollIntoView = false) {
  if (!annotationValid(annotation)) return;
  layout.annotateMode = "view";
  layout.displayedAnnotation = annotation;

  if (scrollIntoView) {
    restorePosition(annotation.page);
    await scrollVisibleAnnotationIntoView();
  }
}
