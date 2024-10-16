import { describe, it, expect, vi } from "vitest";
import { document } from "@/test/fixtures/documents";
import { note } from "@/test/fixtures/notes";
import { getViewerHref } from "../viewer";
import {
  canonicalUrl,
  pageHashUrl,
  READING_MODES,
  WRITING_MODES,
} from "@/lib/api/documents";
import { noteHashUrl } from "@/lib/api/notes";

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
