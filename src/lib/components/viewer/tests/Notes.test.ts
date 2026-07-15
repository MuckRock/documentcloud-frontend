/**
 * Behavioral tests for the Notes viewer pane, rendered through the real
 * ViewerContext provider via renderInViewer. Only pdfjs (network) and the
 * SvelteKit router are mocked.
 */
import type { Document, Note } from "$lib/api/types";

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/svelte";
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
vi.mock("$app/navigation", () => ({ afterNavigate: vi.fn() }));

import Notes from "../Notes.svelte";
import { renderInViewer } from "./renderInViewer";
import documentFixture from "@/test/fixtures/documents/document.json";

const base = documentFixture as unknown as Document;

/** A page-level note (all bbox coords null) — renders without a PDF excerpt. */
function pageLevelNote(id: number): Note {
  return {
    id,
    title: `Note ${id}`,
    content: "note body",
    page_number: 0,
    access: "public",
    x1: null,
    x2: null,
    y1: null,
    y2: null,
    edit_access: false,
  } as unknown as Note;
}

function doc(overrides: Partial<Document>): Document {
  return { ...base, ...overrides };
}

describe("Notes", () => {
  it("prompts editors to annotate when there are no notes", () => {
    renderInViewer(Notes, {
      context: { document: doc({ notes: [], edit_access: true }) },
    });

    // the empty state offers a call-to-action link into annotating mode
    const cta = screen.getByRole("link");
    expect(cta).toBeInTheDocument();
    expect(cta.getAttribute("href")).toContain("annotating");
  });

  it("shows no annotate CTA for viewers without edit access", () => {
    renderInViewer(Notes, {
      context: { document: doc({ notes: [], edit_access: false }) },
    });

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders one entry per note", () => {
    const { container } = renderInViewer(Notes, {
      context: {
        document: doc({
          notes: [pageLevelNote(1), pageLevelNote(2), pageLevelNote(3)],
          edit_access: false,
        }),
        embed: true, // skip the note footer (actions/metadata) to keep it light
      },
    });

    expect(container.querySelectorAll(".note-wrapper")).toHaveLength(3);
    // the empty-state CTA should not appear when notes exist
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
