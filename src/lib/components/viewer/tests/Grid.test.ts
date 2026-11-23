/**
 * Behavioral tests for the Grid (thumbnail) viewer pane, rendered through the
 * real ViewerContext provider via renderInViewer. Only pdfjs (network) and the
 * router are mocked.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
import { readable } from "svelte/store";
import { tick } from "svelte";

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

import type { ViewerState } from "$lib/state/viewer.svelte";
import Grid from "../Grid.svelte";
import ViewerProbe from "@/test/helpers/ViewerProbe.svelte";
import { renderInViewer } from "./renderInViewer";
import { stubViewport } from "@/test/helpers/stubViewport";
import { document } from "@/test/fixtures/documents";
import {
  clearPendingLayout,
  getPendingLayout,
  savePendingLayout,
} from "$lib/state/pendingLayout";

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

  it("shows a spinner in place of a page image missing while the document processes", async () => {
    const { container } = renderInViewer(Grid, {
      context: {
        document: { ...document, status: "pending" },
        mode: "grid",
        embed: true,
      },
    });
    const img = await waitFor(() => {
      const img = container.querySelector("img");
      expect(img).not.toBeNull();
      return img!;
    });

    await fireEvent.error(img);

    expect(await screen.findAllByLabelText("Loading …")).toHaveLength(1);
    expect(container.querySelector('img[alt^="Page 1,"]')).toBeNull();
  });

  it("keeps a failed page image when the document is not processing", async () => {
    const { container } = renderInViewer(Grid, {
      context: { document, mode: "grid", embed: true },
    });
    const img = await waitFor(() => {
      const img = container.querySelector("img");
      expect(img).not.toBeNull();
      return img!;
    });

    await fireEvent.error(img);

    expect(screen.queryByLabelText("Loading …")).toBeNull();
    expect(container.querySelector('img[alt^="Page 1,"]')).not.toBeNull();
  });

  it("turns a rotated page's image outside bulk edit mode", async () => {
    let viewer!: ViewerState;
    const { container } = renderInViewer(ViewerProbe, {
      props: {
        component: Grid,
        onViewer: (v: ViewerState) => (viewer = v),
      },
      context: { document, mode: "grid", loadPdf: false },
    });
    await waitFor(() => expect(container.querySelector("img")).not.toBeNull());

    viewer.history.edit({ action: "cw", pages: [viewer.pages[0]!.id] });

    await waitFor(() =>
      expect(
        container
          .querySelector<HTMLElement>(".image")!
          .style.getPropertyValue("--rotation"),
      ).toBe("90deg"),
    );
  });

  it("keeps a layout saved while the document is still marked processed", async () => {
    const { container } = renderInViewer(Grid, {
      context: { document, mode: "grid", loadPdf: false },
    });
    await waitFor(() => expect(container.querySelector("img")).not.toBeNull());

    savePendingLayout(document, [], null);
    await tick();

    expect(getPendingLayout({ ...document, status: "pending" })).not.toBeNull();
    clearPendingLayout(document.id);
  });

  describe("in bulk edit mode", () => {
    function renderBulk() {
      let viewer!: ViewerState;
      const result = renderInViewer(ViewerProbe, {
        props: {
          component: Grid,
          onViewer: (v: ViewerState) => (viewer = v),
        },
        context: { document, mode: "bulk", loadPdf: false },
      });
      return { viewer, ...result };
    }

    const firstImage = (container: HTMLElement) =>
      container.querySelector<HTMLImageElement>("img")!;

    it("gives each page a selection checkbox", async () => {
      renderBulk();

      expect(await screen.findByLabelText("Select page 1")).not.toBeChecked();
    });

    it("outlines selected pages", async () => {
      const { viewer, container } = renderBulk();
      await waitFor(() => expect(firstImage(container)).not.toBeNull());

      viewer.selectedPages.add(viewer.pages[0]!.id);

      await waitFor(() =>
        expect(firstImage(container)).toHaveClass("selected"),
      );
    });

    it("turns a rotated page's image to fill its landscape slot", async () => {
      const { viewer, container } = renderBulk();
      await waitFor(() => expect(firstImage(container)).not.toBeNull());

      viewer.history.edit({ action: "cw", pages: [viewer.pages[0]!.id] });

      const box = () => container.querySelector<HTMLElement>(".image")!;
      await waitFor(() =>
        expect(box().style.getPropertyValue("--rotation")).toBe("90deg"),
      );
      const slot = [
        parseFloat(box().style.width),
        parseFloat(box().style.height),
      ];
      expect(slot[0]).toBeGreaterThan(slot[1]!);

      // Drawn upright at the slot's swapped size, so the quarter turn fills it.
      const img = firstImage(container);
      expect([img.width, img.height]).toEqual(slot.reverse().map(Math.floor));
    });
  });
});
