/**
 * Behavioral tests for the PDF pane, rendered through the real ViewerContext
 * provider via renderInViewer.
 *
 * pdfjs stays pending (no canvas draw), and the router is mocked. The error
 * branch is driven by seeding `errors`.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { readable } from "svelte/store";

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  GlobalWorkerOptions: { workerSrc: "mock-worker" },
  PDFDataRangeTransport: class {},
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

import PDF from "../PDF.svelte";
import { renderInViewer } from "./renderInViewer";
import { stubViewport } from "@/test/helpers/stubViewport";
import { document } from "@/test/fixtures/documents";

describe("PDF", () => {
  beforeEach(() => stubViewport({ itemHeight: 1000 }));

  it("renders a window of pages, not the whole document", async () => {
    const { container } = renderInViewer(PDF, {
      context: { document, mode: "document" },
    });

    expect(container.querySelector(".pages")).not.toBeNull();
    await waitFor(() => {
      const count = container.querySelectorAll(".page").length;
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(document.page_count);
    });
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
