import { Results } from "./results";

function makeResults(num) {
  const results = [];
  for (let i = 0; i < num; i++) {
    results.push([]);
  }
  return results;
}

test("page count", () => {
  // Two per page, 5 total results, should have 3 pages
  const results = new Results("results/", {
    count: 5,
    next: "results/?page=2",
    previous: null,
    results: makeResults(2)
  });

  expect(results.page).toBe(0);
  expect(results.perPage).toBe(2);
  expect(results.start).toBe(0);
  expect(results.end).toBe(2);
  expect(results.numPages).toBe(3);
  expect(results.hasNext).toBe(true);
  expect(results.hasPrev).toBe(false);

  expect(results.getUrl(0)).toBe("results/?page=1");
  expect(results.getUrl(1)).toBe("results/?page=2");
  expect(results.getUrl(2)).toBe("results/?page=3");
});

test("with prev page", () => {
  // Two per page, 5 total results, should have 3 pages
  const results = new Results("results/?page=2", {
    count: 5,
    previous: "results/?page=1",
    next: "results/?page=3",
    results: makeResults(2)
  });

  expect(results.page).toBe(1);
  expect(results.perPage).toBe(2);
  expect(results.start).toBe(2);
  expect(results.end).toBe(4);
  expect(results.numPages).toBe(3);
  expect(results.hasNext).toBe(true);
  expect(results.hasPrev).toBe(true);

  expect(results.getUrl(0)).toBe("results/?page=1");
  expect(results.getUrl(1)).toBe("results/?page=2");
  expect(results.getUrl(2)).toBe("results/?page=3");
});

test("no next page", () => {
  // Two per page, 5 total results, should have 3 pages
  const results = new Results("results/?param&page=3", {
    count: 5,
    previous: "results/?param&page=2",
    next: null,
    results: makeResults(1)
  });

  expect(results.page).toBe(2);
  expect(results.perPage).toBe(2);
  expect(results.start).toBe(4);
  expect(results.end).toBe(5);
  expect(results.numPages).toBe(3);
  expect(results.hasNext).toBe(false);
  expect(results.hasPrev).toBe(true);

  expect(results.getUrl(0)).toBe("results/?param&page=1");
  expect(results.getUrl(1)).toBe("results/?param&page=2");
  expect(results.getUrl(2)).toBe("results/?param&page=3");
});

test("empty results", () => {
  const results = new Results("results/", {
    count: 0,
    previous: null,
    next: null,
    results: []
  });

  expect(results.length).toBe(0);
});

test("page count complex", () => {
  const results = new Results("results/?page=2", {
    count: 31,
    previous: "results/?page=1",
    next: null,
    results: makeResults(6)
  });

  expect(results.page).toBe(1);
  expect(results.perPage).toBe(25);
  expect(results.start).toBe(25);
  expect(results.end).toBe(31);
  expect(results.numPages).toBe(2);
  expect(results.hasNext).toBe(false);
  expect(results.hasPrev).toBe(true);
});
