import { runify } from "./pageSpec";

function runspec(pgNumbers) {
  return runify(pgNumbers).spec();
}

test("page spec", () => {
  expect(runspec([])).toBe('');
  expect(runspec([1])).toBe('1');
  expect(runspec([1, 2, 3])).toBe('1-3');
  expect(runspec([1, 3])).toBe('1,3');
  expect(runspec([1, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 1])).toBe('1,3-4,7-9,1-5,1');
});

test("page spec to numbers", () => {
  expect(runify([]).toNumbers()).toEqual([]);
  expect(runify([1]).toNumbers()).toEqual([1]);
  expect(runify([1, 2, 3]).toNumbers()).toEqual([1, 2, 3]);
  expect(runify([1, 3]).toNumbers()).toEqual([1, 3]);
  expect(runify([1, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 1]).toNumbers()).toEqual([1, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 1]);
});
