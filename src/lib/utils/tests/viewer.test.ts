import type { ViewerMode } from "$lib/api/types";

import { describe, it, test, expect } from "vitest";
import { document } from "@/test/fixtures/documents";
import { note } from "@/test/fixtures/notes";
import {
  fitPage,
  getViewerHref,
  pageSizes,
  sortedSections,
  zoomToScale,
  zoomToSize,
  getZoomLevels,
  getDefaultZoom,
  getInitialZoom,
  getZoomInOut,
} from "../viewer";
import {
  canonicalUrl,
  pageHashUrl,
  READING_MODES,
  WRITING_MODES,
  MODES,
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

describe("zoom", () => {
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
    expect(getDefaultZoom("document")).toEqual("auto");
    expect(getDefaultZoom("text")).toEqual(1);
    expect(getDefaultZoom("grid")).toEqual("small");
    expect(getDefaultZoom("notes")).toEqual(1);
    expect(getDefaultZoom("annotating")).toEqual("auto");
    expect(getDefaultZoom("redacting")).toEqual("auto");
  });

  test("getZoomLevels offers auto plus percentages in page modes", () => {
    // "auto" replaced the old fit-width/fit-height options
    (["document", "annotating", "redacting"] as ViewerMode[]).forEach(
      (mode) => {
        const values = getZoomLevels(mode).map(([value]) => value);
        expect(values).toEqual(["auto", 0.5, 0.75, 1, 1.25, 1.5, 2]);
        expect(values).not.toContain("width");
        expect(values).not.toContain("height");
      },
    );
  });

  test("getZoomLevels", () => {
    expect(getZoomLevels("document")).toMatchSnapshot();
    expect(getZoomLevels("text")).toMatchSnapshot();
    expect(getZoomLevels("grid")).toMatchSnapshot();
    expect(getZoomLevels("notes")).toMatchSnapshot();
    expect(getZoomLevels("annotating")).toMatchSnapshot();
    expect(getZoomLevels("redacting")).toMatchSnapshot();
  });

  test("getInitialZoom", () => {
    // test every combination of mode and zoom level
    MODES.forEach((mode) => {
      const levels = getZoomLevels(mode);

      levels.forEach(([zoom, _label]) => {
        const url = canonicalUrl(document);
        url.searchParams.set("zoom", String(zoom));

        const result = getInitialZoom(url, mode);

        expect(result).toEqual(zoom);
      });
    });
  });

  test("getInitialZoom allows any valid zoom value", () => {
    // Modes that support numeric zoom (scale-based)
    const numericZoomModes: ViewerMode[] = [
      "document",
      "text",
      "annotating",
      "redacting",
    ];

    // Test arbitrary numeric zoom values
    const arbitraryZoomValues = [0.37, 0.85, 1.13, 2.5, 3.0];

    numericZoomModes.forEach((mode) => {
      arbitraryZoomValues.forEach((zoomValue) => {
        const url = canonicalUrl(document);
        url.searchParams.set("zoom", String(zoomValue));

        const result = getInitialZoom(url, mode);

        expect(result).toEqual(zoomValue);
      });
    });

    // Grid mode uses size-based zoom, so arbitrary numeric values should return undefined
    arbitraryZoomValues.forEach((zoomValue) => {
      const url = canonicalUrl(document);
      url.searchParams.set("zoom", String(zoomValue));

      const result = getInitialZoom(url, "grid");

      expect(result).toBeUndefined();
    });

    // Notes mode doesn't support zoom
    arbitraryZoomValues.forEach((zoomValue) => {
      const url = canonicalUrl(document);
      url.searchParams.set("zoom", String(zoomValue));

      const result = getInitialZoom(url, "notes");

      expect(result).toBeUndefined();
    });
  });

  test("getInitialZoom returns undefined by default", () => {
    MODES.forEach((mode) => {
      const url = canonicalUrl(document);

      url.searchParams.set("mode", mode);

      const result = getInitialZoom(url, mode);

      expect(result).toBeUndefined();
    });
  });
});

describe("getZoomInOut", () => {
  // The zoom in/out buttons step through the mode's zoom levels. For page
  // modes the step is chosen by comparing against the *rendered* scale, so
  // that stepping away from "auto" lands on a neighbouring percentage rather
  // than on a fixed index.
  describe("page modes", () => {
    const modes: ViewerMode[] = ["document", "annotating", "redacting", "text"];

    it("steps to the neighbouring levels of the current scale", () => {
      modes.forEach((mode) => {
        expect(getZoomInOut(mode, 1, 1)).toEqual([0.75, 1.25]);
        expect(getZoomInOut(mode, 0.75, 0.75)).toEqual([0.5, 1]);
        expect(getZoomInOut(mode, 1.5, 1.5)).toEqual([1.25, 2]);
      });
    });

    it("returns null at the bottom and top of the range", () => {
      modes.forEach((mode) => {
        // nothing below 50%
        expect(getZoomInOut(mode, 0.5, 0.5)).toEqual([null, 0.75]);
        // nothing above 200%
        expect(getZoomInOut(mode, 2, 2)).toEqual([1.5, null]);
      });
    });

    it("uses the computed scale, not the literal zoom, for 'auto'", () => {
      // "auto" is not a number, so the neighbours come from the scale it
      // resolved to — a document rendered at 42% steps up to 50%.
      expect(getZoomInOut("document", "auto", 0.42)).toEqual([null, 0.5]);
      expect(getZoomInOut("document", "auto", 0.8)).toEqual([0.75, 1]);
      expect(getZoomInOut("document", "auto", 1)).toEqual([0.75, 1.25]);
    });

    it("never offers 'auto' itself as a step", () => {
      // "auto" is in the zoom levels list but must be skipped when stepping,
      // since comparing a string to a number is never true.
      const steps = [0.42, 0.5, 1, 2].flatMap((scale) =>
        getZoomInOut("document", "auto", scale),
      );
      expect(steps).not.toContain("auto");
    });

    it("snaps to the surrounding levels for an off-grid scale", () => {
      expect(getZoomInOut("document", 1.1, 1.1)).toEqual([1, 1.25]);
    });
  });

  describe("grid mode", () => {
    it("steps through the size presets by index", () => {
      expect(getZoomInOut("grid", "small", 1)).toEqual(["thumbnail", "normal"]);
      expect(getZoomInOut("grid", "normal", 1)).toEqual(["small", "large"]);
    });

    it("returns null at each end of the presets", () => {
      expect(getZoomInOut("grid", "thumbnail", 1)).toEqual([null, "small"]);
      expect(getZoomInOut("grid", "large", 1)).toEqual(["normal", null]);
    });
  });

  it("returns no steps in notes mode, which has no zoom levels", () => {
    expect(getZoomInOut("notes", 1, 1)).toEqual([null, null]);
  });
});

describe("sortedSections", () => {
  it("orders sections by page number regardless of insertion order", () => {
    const doc = {
      ...document,
      sections: [
        { id: 1, page_number: 4, title: "Later" },
        { id: 2, page_number: 0, title: "First" },
        { id: 3, page_number: 2, title: "Middle" },
      ],
    };

    expect(sortedSections(doc).map((s) => s.page_number)).toEqual([0, 2, 4]);
  });

  it("returns an empty array when there are no sections", () => {
    expect(sortedSections({ ...document, sections: undefined })).toEqual([]);
  });

  it("does not mutate the document's sections array", () => {
    const sections = [
      { id: 1, page_number: 2, title: "B" },
      { id: 2, page_number: 1, title: "A" },
    ];
    const doc = { ...document, sections };

    sortedSections(doc);

    expect(doc.sections.map((s) => s.page_number)).toEqual([2, 1]);
  });
});
