/**
 * Bulk edit applies each action to every selected page, so these tests seed
 * the selection on the real ViewerState and assert on the resulting pages.
 */
import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/svelte";
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

import type { ViewerState } from "$lib/state/viewer.svelte";
import BulkEditToolbar from "../BulkEditToolbar.svelte";
import ViewerProbe from "@/test/helpers/ViewerProbe.svelte";
import { renderInViewer } from "../../viewer/tests/renderInViewer";
import { document as fixture } from "@/test/fixtures/documents";

const PAGE_COUNT = 5;
const document = {
  ...fixture,
  page_count: PAGE_COUNT,
  page_spec: "612.0x792.0:0-4",
};

function renderToolbar() {
  let viewer!: ViewerState;
  renderInViewer(ViewerProbe, {
    props: {
      component: BulkEditToolbar,
      onViewer: (v: ViewerState) => (viewer = v),
    },
    context: { document, mode: "bulk", loadPdf: false },
  });
  return viewer;
}

/** Select the pages currently at these (zero-indexed) positions. */
function select(viewer: ViewerState, ...positions: number[]) {
  positions.forEach((n) => viewer.selectedPages.add(viewer.pages[n]!.id));
}

const selectAll = () => screen.getByRole("checkbox") as HTMLInputElement;
const indexes = (viewer: ViewerState) => viewer.pages.map((p) => p.index);

describe("BulkEditToolbar", () => {
  it("disables every action until a page is selected", () => {
    renderToolbar();

    expect(screen.getByText("Select All")).toBeInTheDocument();
    ["Rotate clockwise", "Duplicate", "Delete"].forEach((name) =>
      expect(screen.getByLabelText(name)).toBeDisabled(),
    );
  });

  it("selects every page from the select-all checkbox", async () => {
    const viewer = renderToolbar();

    await fireEvent.click(selectAll());

    expect(viewer.selectedPages.size).toBe(PAGE_COUNT);
    expect(
      screen.getByText(`${PAGE_COUNT} Selected`, { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Delete")).toBeEnabled();
  });

  it("selects every page from a partial selection", async () => {
    const viewer = renderToolbar();
    select(viewer, 1);
    await vi.waitFor(() => expect(selectAll().indeterminate).toBe(true));

    await fireEvent.click(selectAll());

    expect(viewer.selectedPages.size).toBe(PAGE_COUNT);
  });

  it("clears the selection when select-all is unchecked", async () => {
    const viewer = renderToolbar();
    await fireEvent.click(selectAll());

    await fireEvent.click(selectAll());

    expect(viewer.selectedPages.size).toBe(0);
    expect(screen.getByText("Select All")).toBeInTheDocument();
  });

  it("shows a partial selection as indeterminate", async () => {
    const viewer = renderToolbar();
    select(viewer, 0, 3);

    await vi.waitFor(() => expect(selectAll().indeterminate).toBe(true));
    expect(selectAll().checked).toBe(false);
    expect(screen.getByText("2 Selected", { exact: false })).toBeVisible();
  });

  it("rotates only the selected pages", async () => {
    const viewer = renderToolbar();
    select(viewer, 1, 2);

    await fireEvent.click(await screen.findByLabelText("Rotate clockwise"));

    expect(viewer.pages.map((p) => p.rotation)).toEqual([0, 90, 90, 0, 0]);
  });

  it("deletes the selected pages", async () => {
    const viewer = renderToolbar();
    select(viewer, 0, 4);

    await fireEvent.click(await screen.findByLabelText("Delete"));

    expect(indexes(viewer)).toEqual([1, 2, 3]);
  });

  it("clears the selection after deleting", async () => {
    const viewer = renderToolbar();
    select(viewer, 0, 4);

    await fireEvent.click(await screen.findByLabelText("Delete"));

    expect(viewer.selectedPages.size).toBe(0);
    expect(screen.getByLabelText("Delete")).toBeDisabled();
  });

  it("inserts duplicates after the last selected page", async () => {
    const viewer = renderToolbar();
    select(viewer, 1, 3);

    await fireEvent.click(await screen.findByLabelText("Duplicate"));

    expect(indexes(viewer)).toEqual([0, 1, 2, 3, 1, 3, 4]);
  });
});
