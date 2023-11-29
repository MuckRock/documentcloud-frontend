import { expect, test } from "vitest";
import { pageSizesFromSpec } from "./pageSize.js";

test("page sizes empty", () => {
  expect(pageSizesFromSpec("")).toEqual([]);
});

test("page sizes simple", () => {
  expect(pageSizesFromSpec("1x1:0")).toEqual([1]);
});

test("page sizes complex", () => {
  expect(pageSizesFromSpec("1x1:1,3-5,0;1x2:2")).toEqual([1, 1, 2, 1, 1, 1]);
});
