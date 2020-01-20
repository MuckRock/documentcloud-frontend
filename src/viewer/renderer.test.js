import { renderer, setAspect } from "./renderer";

beforeEach(() => {
  // Reset renderer
  renderer.aspects = [];
  renderer.width = 0;
  renderer.bodyHeight = 500;
});

// Helper function to simplify creation of aspects arrays
function aspects(l) {
  return l.map(x => ({ aspect: x }));
}

test("page count", () => {
  // Page count should simply return the number of aspects
  renderer.aspects = aspects([1, 1, 1]);
  expect(renderer.pageCount).toBe(3);

  renderer.aspects = [];
  expect(renderer.pageCount).toBe(0);
});

test("average aspect", () => {
  renderer.aspects = aspects([1, 2, 3]);
  // Average aspect should be 2
  expect(renderer.averageAspect).toBe(2);
  expect(renderer.aspects).toEqual(aspects([1, 2, 3]));
  expect(renderer.computedAspects).toEqual(aspects([1, 2, 3]));

  setAspect(2, 6);
  // Average aspect should change to 3
  expect(renderer.averageAspect).toBe(3);
  expect(renderer.aspects).toEqual(aspects([1, 2, 6]));
  expect(renderer.computedAspects).toEqual(aspects([1, 2, 6]));

  setAspect(1, null);
  // Average aspect with gap
  expect(renderer.averageAspect).toBe(3.5);
  expect(renderer.aspects).toEqual(aspects([1, null, 6]));
  expect(renderer.computedAspects).toEqual(aspects([1, 3.5, 6]));
});

test("aspect runs", () => {
  renderer.aspects = [
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

  renderer.aspects = [
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

  renderer.aspects = [
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

  renderer.aspects = [
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

  renderer.aspects = [];
  // Empty aspects
  expect(renderer.aspectRuns).toEqual([]);
});
