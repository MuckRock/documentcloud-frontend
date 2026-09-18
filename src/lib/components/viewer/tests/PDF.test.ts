/**
 * Behavioral tests for the PDF pane, rendered through the real ViewerContext
 * provider via renderInViewer.
 *
 * PDF renders a PDFPage per page (each wrapped in <Page track>), so an
 * IntersectionObserver stub is needed. pdfjs stays pending (no canvas draw),
 * and the router is mocked. The error branch is driven by seeding `errors`.
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
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
vi.mock("$app/state", () => ({
  page: {
    url: new URL("https://www.documentcloud.org/documents/2622-doc/"),
  },
}));
vi.mock("$app/navigation", () => ({ afterNavigate: vi.fn() }));

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

import PDF from "../PDF.svelte";
import { renderInViewer } from "./renderInViewer";
import { document } from "@/test/fixtures/documents";

describe("PDF", () => {
  it("renders a window of pages, not the whole document", () => {
    const { container } = renderInViewer(PDF, {
      context: { document, mode: "document" },
    });

    expect(container.querySelector(".pages")).not.toBeNull();
    // Pages are rendered through virtua's Virtualizer, which only mounts the
    // pages that fit the viewport. jsdom has no layout engine (the container
    // measures 0x0), so only a small window of the document's 20 pages
    // (612.0x792.0:0-19) mounts rather than all of them.
    const pages = container.querySelectorAll(".page");
    expect(pages.length).toBeGreaterThan(0);
    expect(pages.length).toBeLessThan(document.page_count);
  });

  it("shows an error view instead of pages when loading failed", () => {
    const { container } = renderInViewer(PDF, {
      context: {
        document,
        mode: "document",
        errors: [new Error("could not load document")],
      },
    });

    expect(screen.getByText(/could not load document/)).toBeInTheDocument();
    expect(container.querySelector(".pages")).toBeNull();
  });
});
