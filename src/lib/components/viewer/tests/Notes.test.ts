/**
 * Behavioral tests for the Notes viewer pane, rendered through the real
 * ViewerContext provider via renderInViewer. Only pdfjs (network) and the
 * SvelteKit router are mocked.
 */
import type { Document } from "$lib/api/types";

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
import { document as base } from "@/test/fixtures/documents";
import { notePage } from "@/test/fixtures/notes";

const notes = notePage.results; // 15 real notes

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
    const sample = notes.slice(0, 3);
    const { container } = renderInViewer(Notes, {
      context: {
        document: doc({ notes: sample, edit_access: false }),
        embed: true, // skip the note footer (actions/metadata) to keep it light
      },
    });

    expect(container.querySelectorAll(".note-wrapper")).toHaveLength(
      sample.length,
    );
    // the first note's title is shown
    expect(screen.getByText(sample[0]!.title!)).toBeInTheDocument();
  });
});
