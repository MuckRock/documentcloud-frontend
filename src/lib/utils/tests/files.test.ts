import { describe, test, it, expect } from "vitest";
import * as files from "../files";

describe("files.getFileExtensionFromType", () => {
  it("returns the second half of a Mimetype", () => {
    expect(files.getFileExtensionFromType("application/pdf")).toEqual("pdf");
    expect(files.getFileExtensionFromType("image/jpeg")).toEqual("jpeg");
  });
  it("returns the provided input if not a Mimetype", () => {
    expect(files.getFileExtensionFromType("")).toEqual("");
    expect(files.getFileExtensionFromType("pdf")).toEqual("pdf");
    expect(files.getFileExtensionFromType(undefined)).toEqual("");
  });
});

describe("files.getFileExtension", () => {
  it("returns the extension from the end of the filename", () => {
    const file1 = new File([], "document.pdf");
    const file2 = new File([], "image.jpg");
    expect(files.getFileExtension(file1)).toEqual("pdf");
    expect(files.getFileExtension(file2)).toEqual("jpg");
  });

  it("returns the last extension", () => {
    const file = new File([], "period.delimited.filename.pdf");
    expect(files.getFileExtension(file)).toEqual("pdf");
  });

  it("checks the file type if it's provided", () => {
    const file = new File([], "filename", { type: "application/pdf" });
    expect(files.getFileExtension(file)).toEqual("pdf");
  });

  it("returns undefined if neither filename extension nor file type", () => {
    const file = new File([], "filename");
    expect(files.getFileExtension(file)).toEqual("");
  });
});

test("files.isSupported", () => {
  const file1 = new File([], "document.pdf");
  const file2 = new File([], "invalid.zip");
  expect(files.isSupported(file1)).toBe(true);
  expect(files.isSupported(file2)).toBe(false);
});

describe("files.removeUnsupportedTypes", () => {
  it("evaluates the filename for the type", () => {
    const file1 = new File([], "document.pdf");
    const file2 = new File([], "invalid.zip");
    expect(files.removeUnsupportedTypes([file1, file2])).toEqual([file1]);
  });
  it("ignores files missing an extension", () => {
    const file1 = new File([], "document.pdf");
    const file2 = new File([], "pdf");
    expect(files.removeUnsupportedTypes([file1, file2])).toEqual([file1]);
  });
  it("normalizes filenames to lowercase", () => {
    const file1 = new File([], "document.pdf");
    const file2 = new File([], "valid.PDF");
    expect(files.removeUnsupportedTypes([file1, file2])).toEqual([
      file1,
      file2,
    ]);
  });
});

describe("files.isWithinSizeLimit", () => {
  it("enforces a 500MB max size for PDF files", () => {
    let file = new File([new ArrayBuffer(128000)], "document.pdf");
    expect(files.isWithinSizeLimit(file)).toBe(true);
    file = new File([new ArrayBuffer(525336576)], "document.pdf");
    expect(files.isWithinSizeLimit(file)).toBe(true);
    file = new File([new ArrayBuffer(525336576)], "document");
    expect(files.isWithinSizeLimit(file)).toBe(false);
    file = new File([new ArrayBuffer(525336577)], "document", {
      type: "application/pdf",
    });
    expect(files.isWithinSizeLimit(file)).toBe(false);
  });
  it("enforces a 25MB max size for other file types", () => {
    let file = new File([new ArrayBuffer(128000)], "image.png");
    expect(files.isWithinSizeLimit(file)).toBe(true);
    file = new File([new ArrayBuffer(27262976)], "image", {
      type: "image/png",
    });
    expect(files.isWithinSizeLimit(file)).toBe(true);
    file = new File([new ArrayBuffer(27262977)], "image");
    expect(files.isWithinSizeLimit(file)).toBe(false);
  });
});

test("files.filenameToTitle", () => {
  expect(files.filenameToTitle("foobar.zip")).toEqual("foobar.zip");
  expect(files.filenameToTitle("foo.bar.baz.doc")).toEqual("foo.bar.baz");
  expect(files.filenameToTitle("BIP bim_bAp")).toEqual("BIP bim bAp");
  expect(files.filenameToTitle("PDF_FINAL_FINAL 2")).toEqual(
    "PDF FINAL FINAL 2",
  );

  // strip known extensions
  expect(files.filenameToTitle("This.Is.My.Boomstick.pdf")).toEqual(
    "This.Is.My.Boomstick",
  );
});
