import { describe, expect, it } from "vitest";
import { Page } from "../page.svelte";

describe("Page", () => {
  it("numbers pages from one", () => {
    expect(
      new Page({ index: 0, width: 1, height: 1 }).oneIndexedPageNumber,
    ).toBe(1);
    expect(
      new Page({ index: 9, width: 1, height: 1 }).oneIndexedPageNumber,
    ).toBe(10);
  });

  it("reports aspect ratio as width over height", () => {
    expect(new Page({ index: 0, width: 850, height: 1100 }).aspectRatio).toBe(
      850 / 1100,
    );
  });

  it("is vertical when taller than wide, horizontal when wider", () => {
    expect(new Page({ index: 0, width: 850, height: 1100 }).orientation).toBe(
      "vertical",
    );
    expect(new Page({ index: 0, width: 1100, height: 850 }).orientation).toBe(
      "horizontal",
    );
  });

  it("treats a square page as vertical", () => {
    expect(new Page({ index: 0, width: 10, height: 10 }).orientation).toBe(
      "vertical",
    );
  });

  it("recomputes derived values when its size is filled in later", () => {
    // PDFPage fills in a placeholder page's size once pdf.js loads it
    const page = new Page({ index: 0, width: 0, height: 0 });
    expect(page.aspectRatio).toBeNaN();

    page.width = 1100;
    page.height = 850;
    expect(page.aspectRatio).toBe(1100 / 850);
    expect(page.orientation).toBe("horizontal");
  });

  it("rotates into a new page with the same ID and swapped dimensions", () => {
    const original = new Page({ index: 3, width: 100, height: 200 });
    const rotated = original.rotate();

    expect(rotated).not.toBe(original);
    expect(rotated).toMatchObject({
      id: original.id,
      index: 3,
      width: 200,
      height: 100,
      rotation: 90,
    });
    expect(original.rotation).toBe(0);
  });

  it("rotates counterclockwise to a negative rotation", () => {
    const page = new Page({ index: 0, width: 1, height: 2 });
    expect(page.rotate(false).rotation).toBe(-90);
    expect(page.rotate(false).rotate(false).rotation).toBe(-180);
  });

  it("gives a copy a new ID", () => {
    const original = new Page({ index: 0, width: 1, height: 1 });
    expect(original.copy().id).not.toBe(original.id);
  });

  it("copies into an independent page", () => {
    const original = new Page({ index: 2, width: 100, height: 200 });
    const copy = original.copy();

    expect(copy).not.toBe(original);
    expect(copy).toMatchObject({ index: 2, width: 100, height: 200 });

    copy.width = 300;
    copy.index = 5;
    expect(original.width).toBe(100);
    expect(original.oneIndexedPageNumber).toBe(3);
  });
});
