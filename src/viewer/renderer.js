import { Svue } from "svue";
import { viewer } from "./viewer";
import { withinPercent } from "@/util/epsilon";

const DEFAULT_ASPECT = 11 / 8.5; // letter size paper

export const renderer = new Svue({
  data() {
    return {
      aspects: [],
      width: 800,
      pageRail: 69,
      verticalPageMargin: 6,
      verticalDocumentMargin: 18,
      bodyHeight: 0,
      top: 0,
      viewer
    };
  },
  watch: {
    viewer(viewer) {
      if (viewer.pageAspects != null) initAspects();
    }
  },
  computed: {
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
      return DEFAULT_ASPECT;
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

      if (lastPageOffset == null) {
        throw new Error("No pages visible?");
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
  renderer.aspects = viewer.pageAspects.map(aspect => ({ aspect }));
}

function heightOfAspect(aspect, width, verticalPageMargin) {
  return width * aspect + verticalPageMargin * 2;
}

export function setAspect(pageNumber, aspect) {
  const existingInfo = renderer.aspects[pageNumber];
  let heightShift = 0;
  // Don't trigger updates on same aspect
  if (withinPercent(existingInfo.aspect, aspect, 0.0001)) {
    return;
  }
  if (renderer.pagesAboveTheFold.includes(pageNumber)) {
    // Check for startling page jumps
    const currentHeight = renderer.heights[pageNumber];
    const newHeight = heightOfAspect(
      aspect,
      renderer.width,
      renderer.verticalPageMargin
    );
    heightShift = newHeight - currentHeight;
  }
  renderer.aspects[pageNumber] = { ...existingInfo, aspect };
  renderer.aspects = renderer.aspects;

  // Return an offset to scroll to accommodate page jumps above the fold.
  return heightShift;
}
