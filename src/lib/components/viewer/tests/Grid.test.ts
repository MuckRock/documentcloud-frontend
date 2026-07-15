/**
 * Behavioral tests for the Grid (thumbnail) viewer pane, rendered through the
 * real ViewerContext provider via renderInViewer. Only pdfjs (network) and the
 * router are mocked.
 */
import { describe, it, expect, vi } from "vitest";
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

import Grid from "../Grid.svelte";
import { renderInViewer } from "./renderInViewer";
import { document } from "@/test/fixtures/documents";

describe("Grid", () => {
  it("renders one thumbnail image per page, linked to the page", () => {
    const { container } = renderInViewer(Grid, {
      context: { document, mode: "grid", embed: true },
    });

    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(document.page_count);

    // each image is wrapped in a link to its page
    images.forEach((img, i) => {
      expect(img.getAttribute("alt")).toContain(`Page ${i + 1}`);
      expect(img.closest("a")).not.toBeNull();
    });
  });
});
