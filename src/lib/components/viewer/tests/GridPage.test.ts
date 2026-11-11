import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";
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

import type { Document, ViewerMode } from "$lib/api/types";
import type { ViewerState } from "$lib/state/viewer.svelte";
import GridPage from "../GridPage.svelte";
import ViewerProbe from "@/test/helpers/ViewerProbe.svelte";
import { renderInViewer } from "./renderInViewer";
import { document } from "@/test/fixtures/documents";

const props = {
  id: 1,
  page_number: 1,
  width: 100,
  height: 130,
  margin: 0,
  rotation: 0,
  src: "https://assets.documentcloud.org/p1-small.gif",
};

function renderPage(
  overrides: Partial<typeof props> = {},
  { doc = document, mode = "grid" }: { doc?: Document; mode?: ViewerMode } = {},
) {
  let viewer!: ViewerState;
  const result = renderInViewer(ViewerProbe, {
    props: {
      component: GridPage,
      componentProps: { ...props, ...overrides },
      onViewer: (v: ViewerState) => (viewer = v),
    },
    context: { document: doc, mode, loadPdf: false },
  });
  const img = () => result.container.querySelector("img");
  return { viewer, img, ...result };
}

describe("GridPage", () => {
  it("links the page image to the page in the document viewer", () => {
    const { img } = renderPage({ page_number: 3 });

    expect(img()).toHaveAttribute("src", props.src);
    expect(img()!.getAttribute("alt")).toBe(`Page 3, ${document.title}`);
    expect(img()!.closest("a")).toHaveAttribute(
      "href",
      expect.stringContaining("#document/p3"),
    );
  });

  it("sizes the thumbnail from its slot", () => {
    const { container } = renderPage({ width: 120, height: 90, margin: 15 });
    const box = container.querySelector<HTMLElement>(".page-container")!;

    expect(box.style.getPropertyValue("--width")).toBe("120px");
    expect(box.style.getPropertyValue("--height")).toBe("90px");
    expect(box.style.getPropertyValue("--margin")).toBe("15px");
  });

  it("turns the image for a quarter rotation", () => {
    const { img } = renderPage({ rotation: 270 });

    expect(img()).toHaveClass("turn");
  });

  it("keeps the image upright-sized for a half rotation", () => {
    const { img } = renderPage({ rotation: 180 });

    expect(img()).not.toHaveClass("turn");
  });

  it("shows a spinner when the image is missing while the document processes", async () => {
    const { img } = renderPage({}, { doc: { ...document, status: "pending" } });

    await fireEvent.error(img()!);

    expect(await screen.findByLabelText("Loading …")).toBeInTheDocument();
    expect(img()).toBeNull();
  });

  it("keeps a failed image when the document is not processing", async () => {
    const { img } = renderPage();

    await fireEvent.error(img()!);

    expect(screen.queryByLabelText("Loading …")).toBeNull();
    expect(img()).not.toBeNull();
  });

  describe("in bulk edit mode", () => {
    it("does not link the image", () => {
      const { img } = renderPage({}, { mode: "bulk" });

      expect(img()!.closest("a")).toBeNull();
    });

    it("outlines the page when selected", async () => {
      const { viewer, container } = renderPage({ id: 7 }, { mode: "bulk" });
      const box = () => container.querySelector(".image");
      expect(box()).not.toHaveClass("selected");

      viewer.selectedPages.add(7);

      await waitFor(() => expect(box()).toHaveClass("selected"));
    });
  });
});
