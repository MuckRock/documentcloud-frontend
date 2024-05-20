import { describe, expect, test } from "vitest";
import { pageSizesFromSpec, pageSizes } from "./pageSize.js";

describe("pageSizesFromSpec", () => {
  test("page sizes empty", () => {
    expect(pageSizesFromSpec("")).toEqual([]);
  });

  test("page sizes simple", () => {
    expect(pageSizesFromSpec("1x1:0")).toEqual([1]);
  });

  test("page sizes complex", () => {
    expect(pageSizesFromSpec("1x1:1,3-5,0;1x2:2")).toEqual([1, 1, 2, 1, 1, 1]);
  });
});

describe("pageSizes", () => {
  test("page sizes empty", () => {
    expect(pageSizes("")).toEqual([]);
  });

  test("page sizes simple", () => {
    expect(pageSizes("1x1:0")).toEqual([[1, 1]]);
  });

  test("page sizes complex", () => {
    expect(pageSizes("1x1:1,3-5,0;1x2:2")).toEqual([
      [1, 1],
      [1, 1],
      [1, 2],
      [1, 1],
      [1, 1],
      [1, 1],
    ]);
  });
});
