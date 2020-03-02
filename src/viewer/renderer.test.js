import {
  renderer,
  setAspect,
  restorePosition,
  changeMode,
  scroll
} from "./renderer";

const PAGE_MARGIN = 20;
const BODY_MARGIN = 50;
const PAGE_WIDTH = 500;
const BODY_HEIGHT = 100; // low body height to ensure scrolling makes sense
const DEFAULT_ASPECT = 1;

beforeEach(() => {
  // Reset renderer
  renderer.imageAspects = [];
  renderer.width = PAGE_WIDTH;
  renderer.bodyHeight = BODY_HEIGHT;
  renderer.verticalPageMargin = PAGE_MARGIN;
  renderer.baseVerticalDocumentMargin = BODY_MARGIN;
  renderer.defaultAspect = DEFAULT_ASPECT;
  renderer.mode = "image";
  renderer.top = 0;
  renderer.elem = {};
});

// Helper function to simplify creation of aspects arrays
function aspects(l) {
  return l.map(x => ({ aspect: x }));
}

test("page count", () => {
  // Page count should simply return the number of aspects
  renderer.imageAspects = aspects([1, 1, 1]);
  expect(renderer.pageCount).toBe(3);

  renderer.imageAspects = [];
  expect(renderer.pageCount).toBe(0);
});

test("average aspect", () => {
  renderer.imageAspects = aspects([1, 2, 3]);
  // Average aspect should be 2
  expect(renderer.averageAspect).toBe(2);
  expect(renderer.imageAspects).toEqual(aspects([1, 2, 3]));
  expect(renderer.computedAspects).toEqual(aspects([1, 2, 3]));

  setAspect(2, 6);
  // Average aspect should change to 3
  expect(renderer.averageAspect).toBe(3);
  expect(renderer.imageAspects).toEqual(aspects([1, 2, 6]));
  expect(renderer.computedAspects).toEqual(aspects([1, 2, 6]));

  setAspect(1, null);
  // Average aspect with gap
  expect(renderer.averageAspect).toBe(3.5);
  expect(renderer.imageAspects).toEqual(aspects([1, null, 6]));
  expect(renderer.computedAspects).toEqual(aspects([1, 3.5, 6]));
});

test("aspect runs", () => {
  renderer.imageAspects = [
    { aspect: 1 },
    { aspect: 2, note: 1 },
    { aspect: 3 },
    { aspect: 4 }
  ];
  // One note
  expect(renderer.aspectRuns).toEqual([
    {
      type: "pages",
      total: 1,
      count: 1,
      start: 0,
      end: 1,
      skipStartPageNumber: false
    },
    {
      type: "note",
      note: 1,
      page: 1
    },
    {
      type: "pages",
      total: 9,
      count: 3,
      start: 1,
      end: 4,
      skipStartPageNumber: true
    }
  ]);

  renderer.imageAspects = [
    { aspect: 1, note: 1 },
    { aspect: 2, note: 2 }
  ];
  // Two notes
  expect(renderer.aspectRuns).toEqual([
    {
      type: "note",
      note: 1,
      page: 0
    },
    {
      type: "pages",
      total: 1,
      count: 1,
      start: 0,
      end: 1,
      skipStartPageNumber: true
    },
    {
      type: "note",
      note: 2,
      page: 1
    },
    {
      type: "pages",
      total: 2,
      count: 1,
      start: 1,
      end: 2,
      skipStartPageNumber: true
    }
  ]);

  renderer.imageAspects = [
    { aspect: 1 },
    { aspect: null, note: 1 },
    { aspect: 3 },
    { aspect: 5 }
  ];
  // Aspect runs with a hole
  expect(renderer.aspectRuns).toEqual([
    {
      type: "pages",
      total: 1,
      count: 1,
      start: 0,
      end: 1,
      skipStartPageNumber: false
    },
    {
      type: "note",
      note: 1,
      page: 1
    },
    {
      type: "pages",
      total: 11,
      count: 3,
      start: 1,
      end: 4,
      skipStartPageNumber: true
    }
  ]);

  renderer.imageAspects = [
    { aspect: 1 },
    { aspect: 2 },
    { aspect: 3 },
    { aspect: 4 }
  ];
  // Aspect runs with no notes
  expect(renderer.aspectRuns).toEqual([
    {
      type: "pages",
      total: 10,
      count: 4,
      start: 0,
      end: 4,
      skipStartPageNumber: false
    }
  ]);

  renderer.imageAspects = [];
  // Empty aspects
  expect(renderer.aspectRuns).toEqual([]);
});

test("current page number", async () => {
  renderer.imageAspects = aspects([2, 2, 2, 2, 2]);
  expect(renderer.currentPageNumber).toBe(0);

  // Jump to page 4 (0-indexed is 3)
  await restorePosition(3);
  expect(renderer.top).toBe(
    BODY_MARGIN + (PAGE_WIDTH * 2 + 2 * PAGE_MARGIN) * 3
  );
  expect(renderer.currentPageNumber).toBe(3);

  // Scroll back 1 px and expect same page number
  renderer.top -= 1;
  expect(renderer.currentPageNumber).toBe(3);

  // Scroll forward 2 px and expect still same number
  renderer.top += 2;
  expect(renderer.currentPageNumber).toBe(3);
});

test("image resize", async () => {
  renderer.imageAspects = aspects([2, 2, 2, 2, 2]);
  renderer.textAspects = aspects([null, null, null, null, null]);

  // Ensure the pages renderer at appropriate height
  expect(renderer.overallHeight).toBe(
    (PAGE_WIDTH * 2 + 2 * PAGE_MARGIN) * 5 + BODY_MARGIN * 2
  );
  expect(renderer.top).toBe(0);
  expect(renderer.currentPageNumber).toBe(0);

  // Jump to page 4 (0-indexed is 3)
  await restorePosition(3);
  expect(renderer.top).toBe(
    BODY_MARGIN + (PAGE_WIDTH * 2 + 2 * PAGE_MARGIN) * 3
  );
  expect(renderer.currentPageNumber).toBe(3);

  // Switch modes
  await changeMode("text");

  // We should be on page 4 of the texts
  expect(renderer.top).toBe(
    BODY_MARGIN + (PAGE_WIDTH * DEFAULT_ASPECT + 2 * PAGE_MARGIN) * 3
  );
  expect(renderer.pagesAboveTheFold).toEqual([]);
  expect(renderer.currentPageNumber).toBe(3);

  // Now load page 3 to be smaller, which should influence scroll
  // since the average page height for the 3 prev pages is lower.
  let oldAspect = 1;
  let newAspect = 0.1;
  let shift =
    (PAGE_WIDTH * newAspect + 2 * PAGE_MARGIN) * 3 -
    (PAGE_WIDTH * oldAspect + 2 * PAGE_MARGIN) * 3;
  const actualShift = setAspect(2, newAspect);
  expect(actualShift).toBe(shift);
  await scroll(renderer.top + actualShift);
  expect(renderer.heights).toEqual([
    PAGE_WIDTH * newAspect + 2 * PAGE_MARGIN,
    PAGE_WIDTH * newAspect + 2 * PAGE_MARGIN,
    PAGE_WIDTH * newAspect + 2 * PAGE_MARGIN,
    PAGE_WIDTH * newAspect + 2 * PAGE_MARGIN,
    PAGE_WIDTH * newAspect + 2 * PAGE_MARGIN
  ]);
  expect(renderer.top).toBe(
    BODY_MARGIN + (PAGE_WIDTH * newAspect + 2 * PAGE_MARGIN) * 3
  );
  expect(renderer.currentPageNumber).toBe(3);

  // Load page 5 to be bigger
  oldAspect = 0.1;
  newAspect = (0.1 + 0.6) / 2;
  shift =
    (PAGE_WIDTH * newAspect + 2 * PAGE_MARGIN) * 2 +
    (PAGE_WIDTH * oldAspect + 2 * PAGE_MARGIN) -
    (PAGE_WIDTH * oldAspect + 2 * PAGE_MARGIN) * 3;
  await scroll(renderer.top + setAspect(4, 0.6));
  expect(renderer.top).toBe(
    BODY_MARGIN +
      (PAGE_WIDTH * newAspect + 2 * PAGE_MARGIN) * 2 +
      (PAGE_WIDTH * oldAspect + 2 * PAGE_MARGIN)
  );
  expect(renderer.currentPageNumber).toBe(3);

  // Load current page to be bigger (no shift)
  newAspect = (0.1 + 0.6 + 0.8) / 3;
  shift =
    PAGE_WIDTH * 0.1 +
    2 * PAGE_MARGIN +
    (PAGE_WIDTH * newAspect + 2 * PAGE_MARGIN) * 2 -
    (PAGE_WIDTH * 0.35 + 2 * PAGE_MARGIN) * 2 -
    (PAGE_WIDTH * 0.1 + 2 * PAGE_MARGIN);
  await scroll(renderer.top + setAspect(3, 0.8));
  expect(renderer.top).toBe(
    BODY_MARGIN +
      (PAGE_WIDTH * 0.1 + 2 * PAGE_MARGIN) +
      (PAGE_WIDTH * newAspect + 2 * PAGE_MARGIN) * 2
  );
  expect(renderer.currentPageNumber).toBe(3);
});
