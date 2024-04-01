import { describe, it, expect } from "vitest";
import { removeUnsupportedTypes } from "./validateFiles";

describe("removeUnsupportedTypes", () => {
  it("evaluates the filename for the type", () => {
    const file1 = new File([], "document.pdf");
    const file2 = new File([], "invalid.zip");
    expect(removeUnsupportedTypes([file1, file2])).toEqual([file1]);
  });
  it("ignores files missing an extension", () => {
    const file1 = new File([], "document.pdf");
    const file2 = new File([], "pdf");
    expect(removeUnsupportedTypes([file1, file2])).toEqual([file1]);
  });
  it("normalizes filenames to lowercase", () => {
    const file1 = new File([], "document.pdf");
    const file2 = new File([], "valid.PDF");
    expect(removeUnsupportedTypes([file1, file2])).toEqual([file1, file2]);
  });
});
