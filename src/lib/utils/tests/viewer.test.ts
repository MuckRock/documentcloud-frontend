import { describe, it, test, expect } from "vitest";
import { document } from "@/test/fixtures/documents";
import { note } from "@/test/fixtures/notes";
import {
  fitPage,
  getViewerHref,
  pageSizes,
  zoomToScale,
  zoomToSize,
  getZoomLevels,
  getDefaultZoom,
} from "../viewer";
import {
  canonicalUrl,
  pageHashUrl,
  READING_MODES,
  WRITING_MODES,
} from "$lib/api/documents";
import { noteHashUrl } from "$lib/api/notes";

describe("getViewerHref", () => {
  const docUrl = canonicalUrl(document);
  it("returns an absolute URL when provided a document", () => {
    expect(getViewerHref({ document }).startsWith(docUrl.href)).toBe(true);
  });
  it("returns a relative URL when document is missing", () => {
    expect(getViewerHref().startsWith("?")).toBe(true);
  });
  it("applies the mode as a query parameter", () => {
    const modes = [...READING_MODES, ...WRITING_MODES];
    modes.forEach((mode) => {
      expect(getViewerHref({ mode })).toEqual(`?mode=${mode}`);
      expect(getViewerHref({ document, mode })).toEqual(
        `${docUrl}?mode=${mode}`,
      );
    });
  });
  it("applies embed status query param if true", () => {
    expect(getViewerHref({ embed: true })).toMatch("embed=1");
    expect(getViewerHref({ embed: false })).not.toMatch("embed=0");
    // with document
    expect(getViewerHref({ document, embed: true })).toMatch("embed=1");
    expect(getViewerHref({ document, embed: false })).not.toMatch("embed=0");
  });
  it("adds a page to the URL", () => {
    expect(getViewerHref({ page: 10 })).toMatch(pageHashUrl(10));
    expect(getViewerHref({ document, page: 10 })).toMatch(pageHashUrl(10));
  });
  it("adds a note to the URL", () => {
    expect(getViewerHref({ note })).toMatch(noteHashUrl(note));
    expect(getViewerHref({ document, note })).toMatch(noteHashUrl(note));
  });
  it("overwrites the page hash with the note hash is both are provided", () => {
    expect(getViewerHref({ page: 10, note })).toMatch(noteHashUrl(note));
    expect(getViewerHref({ page: 10, note })).not.toMatch(pageHashUrl(10));
    expect(getViewerHref({ document, page: 10, note })).toMatch(
      noteHashUrl(note),
    );
    expect(getViewerHref({ document, page: 10, note })).not.toMatch(
      pageHashUrl(10),
    );
  });
});

describe("pageSizes", () => {
  // Transform page_spec value into width + height for each page
  it("returns an empty array for an empty pageSpec value", () => {
    expect(pageSizes(" ")).toEqual([]);
  });
  it("splits each pageSpec part into a new array entry", () => {
    expect(pageSizes(";;;;;;")).toEqual(new Array(7));
  });
  it("checks each part for a comma-delimited value", () => {
    expect(pageSizes("1x1:0;2x2:1-3")).toEqual([
      [1, 1],
      [2, 2],
      [2, 2],
      [2, 2],
    ]);
  });
});

describe("fitPage", () => {
  it("returns sensible defaults", () => {
    expect(fitPage(1, 1, undefined, 10)).toEqual(10);
    expect(fitPage(1, 1, undefined, "width")).toEqual(1);
  });
  it("returns a scale based on the container", () => {
    const container = { clientWidth: 1000, clientHeight: 1000 } as HTMLElement;
    expect(fitPage(750, 1000, container, "width")).toEqual(1000 / 750);
    expect(fitPage(750, 2000, container, "height")).toEqual(1000 / 2000);
  });
});

test("zoomToScale", () => {
  expect(zoomToScale("width")).toEqual("width");
  expect(zoomToScale("height")).toEqual("height");
  expect(zoomToScale(1.1)).toEqual(1.1);
  expect(zoomToScale("1.2")).toEqual(1.2);
  expect(zoomToScale(undefined)).toEqual(1);
  expect(zoomToScale("foobar")).toEqual(1);
});

test("zoomToSize", () => {
  expect(zoomToSize("xlarge")).toEqual("xlarge");
  expect(zoomToSize("large")).toEqual("large");
  expect(zoomToSize(2000)).toEqual("small");
});

test("getDefaultZoom", () => {
  expect(getDefaultZoom("document")).toEqual("width");
  expect(getDefaultZoom("text")).toEqual(1);
  expect(getDefaultZoom("grid")).toEqual("small");
  expect(getDefaultZoom("notes")).toEqual(1);
  expect(getDefaultZoom("annotating")).toEqual("width");
  expect(getDefaultZoom("redacting")).toEqual("width");
});

test("getZoomLevels", () => {
  expect(getZoomLevels("document")).toMatchSnapshot();
  expect(getZoomLevels("text")).toMatchSnapshot();
  expect(getZoomLevels("grid")).toMatchSnapshot();
  expect(getZoomLevels("notes")).toMatchSnapshot();
  expect(getZoomLevels("annotating")).toMatchSnapshot();
  expect(getZoomLevels("redacting")).toMatchSnapshot();
});
