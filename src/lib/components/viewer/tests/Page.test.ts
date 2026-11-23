/**
 * Behavioral tests for the generic Page container, rendered through the real
 * ViewerContext provider via renderInViewer.
 *
 * Covers the page-number link and the embed gating of PageActions — the
 * `embed` read the migration must preserve. (The IntersectionObserver ->
 * currentPage write only happens with `track`, which isn't practical to drive
 * in jsdom, so it's left to e2e.)
 *
 * Only pdfjs (network) and the router are mocked.
 */
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
vi.mock("$app/state", () => ({
  page: {
    url: new URL("https://www.documentcloud.org/documents/2622-doc/"),
  },
}));
vi.mock("$app/navigation", () => ({ afterNavigate: vi.fn() }));

import type { ViewerState } from "$lib/state/viewer.svelte";
import Page from "../Page.svelte";
import PageList from "./PageList.svelte";
import { renderInViewer } from "./renderInViewer";
import { document } from "@/test/fixtures/documents";

describe("Page", () => {
  it("renders a page-number link", () => {
    const { container } = renderInViewer(Page, {
      props: { page_number: 3 },
      context: { document, mode: "document" },
    });

    const link = container.querySelector(".pageNumber a") as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.textContent).toContain("3");
    expect(link.getAttribute("href")).toBeTruthy();
  });

  it("renders page actions when not embedded", () => {
    const { container } = renderInViewer(Page, {
      props: { page_number: 1 },
      context: { document, mode: "document", embed: false },
    });

    expect(container.querySelector(".page-actions")).not.toBeNull();
  });

  it("omits page actions in embed mode", () => {
    const { container } = renderInViewer(Page, {
      props: { page_number: 1 },
      context: { document, mode: "document", embed: true },
    });

    expect(container.querySelector(".page-actions")).toBeNull();
  });
});

describe("Page in edit mode", () => {
  // Three pages keep the expected orders short.
  const threePages = {
    ...document,
    page_count: 3,
    page_spec: "612.0x792.0:0-2",
  };

  function renderPages(mode: "edit" | "bulk") {
    let viewer!: ViewerState;
    renderInViewer(PageList, {
      props: { onViewer: (v: ViewerState) => (viewer = v) },
      context: { document: threePages, mode, loadPdf: false },
    });
    return viewer;
  }

  const page = (n: number) => within(screen.getByTestId(`page-${n}`));
  const indexes = (viewer: ViewerState) => viewer.pages.map((p) => p.index);

  it("replaces page actions with edit actions", () => {
    const { container } = renderInViewer(Page, {
      props: { page_number: 1 },
      context: { document, mode: "edit", loadPdf: false },
    });

    expect(container.querySelector(".page-actions")).toBeNull();
    expect(screen.getByLabelText("Rotate clockwise")).toBeInTheDocument();
  });

  it("can't move the first page up or the last page down", () => {
    renderPages("edit");

    expect(page(1).getByLabelText("Move up")).toBeDisabled();
    expect(page(1).getByLabelText("Move down")).toBeEnabled();
    expect(page(3).getByLabelText("Move up")).toBeEnabled();
    expect(page(3).getByLabelText("Move down")).toBeDisabled();
  });

  it("moves a page down one place", async () => {
    const viewer = renderPages("edit");

    await fireEvent.click(page(1).getByLabelText("Move down"));

    expect(indexes(viewer)).toEqual([1, 0, 2]);
  });

  it("moves a page up one place", async () => {
    const viewer = renderPages("edit");

    await fireEvent.click(page(3).getByLabelText("Move up"));

    expect(indexes(viewer)).toEqual([0, 2, 1]);
  });

  it("moves the second page up to the front", async () => {
    const viewer = renderPages("edit");

    await fireEvent.click(page(2).getByLabelText("Move up"));

    expect(indexes(viewer)).toEqual([1, 0, 2]);
  });

  it("rotates, duplicates and deletes its own page", async () => {
    const viewer = renderPages("edit");

    await fireEvent.click(page(2).getByLabelText("Rotate counterclockwise"));
    expect(viewer.pages.map((p) => p.rotation)).toEqual([0, -90, 0]);

    await fireEvent.click(page(2).getByLabelText("Duplicate"));
    expect(indexes(viewer)).toEqual([0, 1, 1, 2]);

    await fireEvent.click(page(1).getByLabelText("Delete"));
    expect(indexes(viewer)).toEqual([1, 1, 2]);
  });

  it("selects and deselects a page from its checkbox in bulk mode", async () => {
    const viewer = renderPages("bulk");
    const checkbox = page(2).getByLabelText("Select page 2");

    await fireEvent.click(checkbox);
    expect([...viewer.selectedPages]).toEqual([viewer.pages[1]!.id]);

    await fireEvent.click(checkbox);
    expect(viewer.selectedPages.size).toBe(0);
  });

  it("checks pages selected elsewhere, like the select-all box", async () => {
    const viewer = renderPages("bulk");

    viewer.selectedPages.add(viewer.pages[2]!.id);

    await waitFor(() =>
      expect(page(3).getByLabelText("Select page 3")).toBeChecked(),
    );
    expect(page(1).getByLabelText("Select page 1")).not.toBeChecked();
  });
});
