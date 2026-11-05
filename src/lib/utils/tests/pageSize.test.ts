import { describe, expect, test } from "vitest";
import { pageSizes, pagesFromSpec, PT_TO_PX } from "../pageSize";

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

describe("pagesFromSpec", () => {
  test("returns no pages for an empty spec", () => {
    expect(pagesFromSpec("")).toEqual([]);
  });

  test("converts page dimensions from points to pixels", () => {
    const [page] = pagesFromSpec("612x792:0");
    expect(page!.width).toBe(612 * PT_TO_PX);
    expect(page!.height).toBe(792 * PT_TO_PX);
  });

  test("indexes each page by its position in the document", () => {
    const pages = pagesFromSpec("612x792:0,2;792x612:1");
    expect(pages.map((p) => p.index)).toEqual([0, 1, 2]);
  });

  test("creates a distinct Page for each page sharing a size", () => {
    const [first, second] = pagesFromSpec("612x792:0-1");
    expect(first).not.toBe(second);
  });
});
