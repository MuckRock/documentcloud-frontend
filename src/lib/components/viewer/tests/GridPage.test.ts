import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/svelte";
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

import type { ComponentProps } from "svelte";
import type { Document, ViewerMode } from "$lib/api/types";
import type { ViewerState } from "$lib/state/viewer.svelte";
import GridPageList from "./GridPageList.svelte";
import { renderInViewer } from "./renderInViewer";
import { document } from "@/test/fixtures/documents";

const threePages: Document = {
  ...document,
  page_count: 3,
  page_spec: "612.0x792.0:0-2",
};

function renderPages(
  pageProps: ComponentProps<typeof GridPageList>["pageProps"] = {},
  {
    doc = threePages,
    mode = "grid",
  }: { doc?: Document; mode?: ViewerMode } = {},
) {
  let viewer!: ViewerState;
  const result = renderInViewer(GridPageList, {
    props: { pageProps, onViewer: (v: ViewerState) => (viewer = v) },
    context: { document: doc, mode, loadPdf: false },
  });
  return { viewer, ...result };
}

const page = (n: number) => screen.getByTestId(`page-${n}`);
const img = (n: number) => page(n).querySelector("img");
const box = (n: number) =>
  page(n).querySelector<HTMLElement>(".page-container")!;

describe("GridPage", () => {
  it("links the page image to its page in the document viewer", () => {
    renderPages();

    expect(img(3)).toHaveAttribute(
      "src",
      "https://assets.documentcloud.org/p3-small.gif",
    );
    expect(img(3)).toHaveAttribute("alt", `Page 3, ${document.title}`);
    expect(img(3)!.closest("a")).toHaveAttribute(
      "href",
      expect.stringContaining("#document/p3"),
    );
  });

  it("sizes the thumbnail from its slot", () => {
    renderPages({ width: 120, height: 90, margin: 15 });

    expect(box(1).style.getPropertyValue("--width")).toBe("120px");
    expect(box(1).style.getPropertyValue("--height")).toBe("90px");
    expect(box(1).style.getPropertyValue("--margin")).toBe("15px");
  });

  it("turns the image for a quarter rotation", () => {
    renderPages({ rotation: 270 });

    expect(img(1)).toHaveClass("turn");
  });

  it("keeps the image upright-sized for a half rotation", () => {
    renderPages({ rotation: 180 });

    expect(img(1)).not.toHaveClass("turn");
  });

  it("shows a spinner when the image is missing while the document processes", async () => {
    renderPages({}, { doc: { ...threePages, status: "pending" } });

    await fireEvent.error(img(1)!);

    expect(
      await within(page(1)).findByLabelText("Loading …"),
    ).toBeInTheDocument();
    expect(img(1)).toBeNull();
    expect(img(2)).not.toBeNull();
  });

  it("keeps a failed image when the document is not processing", async () => {
    renderPages();

    await fireEvent.error(img(1)!);

    expect(screen.queryByLabelText("Loading …")).toBeNull();
    expect(img(1)).not.toBeNull();
  });

  describe("in bulk edit mode", () => {
    const renderBulk = () => renderPages({}, { mode: "bulk" });

    const selected = (viewer: ViewerState) =>
      viewer.pages.flatMap(({ id }, i) =>
        viewer.selectedPages.has(id) ? [i + 1] : [],
      );

    it("does not link the image", () => {
      renderBulk();

      expect(img(1)!.closest("a")).toBeNull();
    });

    it("outlines the page when selected", async () => {
      const { viewer } = renderBulk();
      const image = () => page(2).querySelector(".image");
      expect(image()).not.toHaveClass("selected");

      viewer.selectedPages.add(viewer.pages[1]!.id);

      await waitFor(() => expect(image()).toHaveClass("selected"));
    });

    it("selects and deselects a page by clicking its image", async () => {
      const { viewer } = renderBulk();

      await fireEvent.click(img(2)!);
      expect(selected(viewer)).toEqual([2]);

      await fireEvent.click(img(2)!);
      expect(selected(viewer)).toEqual([]);
    });

    it("selects the pages between two clicked images on shift-click", async () => {
      const { viewer } = renderBulk();

      await fireEvent.click(img(1)!);
      await fireEvent.click(img(3)!, { shiftKey: true });

      expect(selected(viewer)).toEqual([1, 2, 3]);
    });

    it("badges every page with the size of the selection to drag", async () => {
      const { viewer } = renderBulk();

      viewer.selectedPages.add(viewer.pages[0]!.id);
      viewer.selectedPages.add(viewer.pages[2]!.id);

      await waitFor(() =>
        expect(box(2)).toHaveAttribute("data-drag-count", "2"),
      );
    });
  });
});
