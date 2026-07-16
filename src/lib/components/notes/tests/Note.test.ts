/**
 * Behavioral tests for a single Note, rendered through the real ViewerContext
 * provider via renderInViewer. Focuses on the mode/embed conditionals the
 * stores -> ViewerState migration must preserve (footer actions, close button).
 *
 * Only pdfjs (network) and the router are mocked.
 */
import { describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/svelte";
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

import Note from "../Note.svelte";
import { renderInViewer } from "../../viewer/tests/renderInViewer";
import { document } from "@/test/fixtures/documents";
import { note } from "@/test/fixtures/notes";

/** Buttons inside the note's header (the close button, when present). */
function headerButtons(container: HTMLElement) {
  const header = container.querySelector("header") as HTMLElement;
  return within(header).queryAllByRole("button");
}

describe("Note", () => {
  it("renders the note title and content", () => {
    renderInViewer(Note, {
      props: { note, showExcerpt: false },
      context: { document, mode: "notes", embed: true },
    });

    expect(screen.getByText(note.title!)).toBeInTheDocument();
    expect(screen.getByText(/revolutionary proposal/)).toBeInTheDocument();
  });

  it("hides the actions footer in embed mode", () => {
    const { container } = renderInViewer(Note, {
      props: { note, showExcerpt: false },
      context: { document, mode: "document", embed: true },
    });

    expect(container.querySelector("footer")).toBeNull();
  });

  it("shows the actions footer when not embedded", () => {
    const { container } = renderInViewer(Note, {
      props: { note, showExcerpt: false },
      context: { document, mode: "document", embed: false },
    });

    expect(container.querySelector("footer")).not.toBeNull();
  });

  it("offers a close button only in document mode (not embedded)", () => {
    const { container } = renderInViewer(Note, {
      props: { note, showExcerpt: false },
      context: { document, mode: "document", embed: false },
    });
    expect(headerButtons(container)).toHaveLength(1);
  });

  it("has no close button outside document mode", () => {
    const { container } = renderInViewer(Note, {
      props: { note, showExcerpt: false },
      context: { document, mode: "notes", embed: false },
    });
    expect(headerButtons(container)).toHaveLength(0);
  });
});
