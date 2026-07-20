/**
 * Behavioral tests for AnnotationLayer, the viewer's main note writer, rendered
 * through the real ViewerContext provider via renderInViewer.
 *
 * Covers rendering existing notes, entering "writing" mode, and the
 * draw-a-box / escape-to-close interaction — the note-drawing state that the
 * stores -> ViewerState migration must preserve.
 *
 * jsdom has no PointerEvent, so pointer interactions are dispatched as
 * MouseEvents (offsetX/clientWidth are 0 in jsdom, which is fine here).
 */
import type { Document } from "$lib/api/types";

import { describe, it, expect, vi } from "vitest";
import { fireEvent } from "@testing-library/svelte";
import { readable } from "svelte/store";

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  GlobalWorkerOptions: { workerSrc: "mock-worker" },
  getDocument: vi.fn(() => ({
    promise: new Promise(() => {}),
    onProgress: null,
  })),
}));
vi.mock("$app/stores", () => ({
  page: readable({
    url: new URL("https://www.documentcloud.org/documents/2622-doc/"),
  }),
}));
const { goto, invalidate } = vi.hoisted(() => ({
  goto: vi.fn(),
  invalidate: vi.fn(),
}));
vi.mock("$app/navigation", () => ({
  goto,
  invalidate,
  afterNavigate: vi.fn(),
}));

import AnnotationLayer from "../AnnotationLayer.svelte";
import { renderInViewer } from "./renderInViewer";
import { document as base } from "@/test/fixtures/documents";
import { notePage } from "@/test/fixtures/notes";
const notes = notePage.results; // 15 real, positioned notes across several pages
const page0Notes = notes.filter((n) => n.page_number === 0);

function docWith(ns: typeof notes): Document {
  return { ...base, notes: ns };
}

describe("AnnotationLayer", () => {
  it("renders positioned notes for its page as highlights", () => {
    const { container } = renderInViewer(AnnotationLayer, {
      props: { page_number: 0 },
      context: { document: docWith(notes), mode: "document" },
    });

    // only the notes on page 0 belong to this layer
    const highlights = container.querySelectorAll(".note-highlight");
    expect(highlights).toHaveLength(page0Notes.length);
    expect(highlights[0]!.textContent).toContain(page0Notes[0]!.title);
  });

  it("enters writing mode when the viewer mode is annotating", () => {
    const { container } = renderInViewer(AnnotationLayer, {
      props: { page_number: 0 },
      context: { document: docWith([]), mode: "annotating" },
    });

    expect(container.querySelector(".notes.writing")).not.toBeNull();
  });

  it("draws a box on pointer-down and clears it on Escape", async () => {
    const { container } = renderInViewer(AnnotationLayer, {
      props: { page_number: 0 },
      context: { document: docWith([]), mode: "annotating" },
    });

    const surface = container.querySelector(".notes") as HTMLElement;

    // start drawing a note box
    await fireEvent(surface, new MouseEvent("pointerdown", { bubbles: true }));
    expect(container.querySelector(".box")).not.toBeNull();

    // Escape cancels the in-progress note and navigates back
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(container.querySelector(".box")).toBeNull();
    expect(goto).toHaveBeenCalled();
  });
});
