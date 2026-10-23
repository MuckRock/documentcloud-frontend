/**
 * Behavioral tests for the Grid (thumbnail) viewer pane, rendered through the
 * real ViewerContext provider via renderInViewer. Only pdfjs (network) and the
 * router are mocked.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
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
vi.mock("$app/navigation", () => ({ afterNavigate: vi.fn() }));

import Grid from "../Grid.svelte";
import { renderInViewer } from "./renderInViewer";
import { stubViewport } from "@/test/helpers/stubViewport";
import { document } from "@/test/fixtures/documents";

describe("Grid", () => {
  beforeEach(() => stubViewport({ itemHeight: 300 }));

  it("renders thumbnails for the pages in view, linked to each page", async () => {
    const { container } = renderInViewer(Grid, {
      context: { document, mode: "grid", embed: true },
    });

    await waitFor(() => {
      const count = container.querySelectorAll("img").length;
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(document.page_count);
    });
    const images = container.querySelectorAll("img");

    // each image is wrapped in a link to its page
    images.forEach((img, i) => {
      expect(img.getAttribute("alt")).toContain(`Page ${i + 1}`);
      expect(img.closest("a")).not.toBeNull();
    });
  });
});
