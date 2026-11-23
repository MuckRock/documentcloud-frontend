import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
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
  page: { url: new URL("https://www.documentcloud.org/documents/2622-doc/") },
}));

const { goto, invalidate, enhance } = vi.hoisted(() => ({
  goto: vi.fn(),
  invalidate: vi.fn(),
  enhance: vi.fn(),
}));
vi.mock("$app/navigation", () => ({
  goto,
  invalidate,
  afterNavigate: vi.fn(),
}));
vi.mock("$app/forms", () => ({ enhance }));

import type { SubmitFunction } from "@sveltejs/kit";
import type { ViewerState } from "$lib/state/viewer.svelte";
import EditToolbar from "../EditToolbar.svelte";
import ViewerProbe from "@/test/helpers/ViewerProbe.svelte";
import { renderInViewer } from "../../viewer/tests/renderInViewer";
import { getViewerHref } from "$lib/utils/viewer";
import { document } from "@/test/fixtures/documents";

function renderToolbar(mode: "edit" | "bulk" = "edit") {
  let viewer!: ViewerState;
  const result = renderInViewer(ViewerProbe, {
    props: {
      component: EditToolbar,
      onViewer: (v: ViewerState) => (viewer = v),
    },
    context: { document, mode, loadPdf: false },
  });
  return { viewer, ...result };
}

function rotateFirstPage(viewer: ViewerState) {
  viewer.history.edit({ action: "cw", pages: [viewer.pages[0]!.id] });
}

/** Run the form's enhance callback the way SvelteKit would on submit. */
async function submit(result: { type: "success" | "failure" }) {
  const callback: SubmitFunction = enhance.mock.lastCall![1];
  const form = window.document.querySelector("form")!;
  const button = form.querySelector("button")!;
  const after = await callback({ formElement: form, submitter: button } as any);
  await (after as Function)({ result });
  return { form, button };
}

const documentHref = getViewerHref({ document, mode: "document" });
const gridHref = getViewerHref({ document, mode: "grid" });

describe("EditToolbar", () => {
  beforeEach(() => {
    vi.spyOn(window, "confirm");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    goto.mockReset();
    invalidate.mockReset();
    enhance.mockReset();
  });

  it("disables Undo until there is an edit to undo", async () => {
    const { viewer } = renderToolbar();
    const undo = screen.getByTitle("Undo");

    expect(undo).toBeDisabled();

    rotateFirstPage(viewer);
    await waitFor(() => expect(undo).toBeEnabled());

    await fireEvent.click(undo);
    expect(viewer.history.hasEntries).toBe(false);
    expect(undo).toBeDisabled();
  });

  it("submits the serialized edits to the modify action", async () => {
    const { viewer, container } = renderToolbar();
    rotateFirstPage(viewer);

    const form = container.querySelector("form")!;
    expect(form.getAttribute("action")).toMatch(/\?\/modify$/);

    const input = form.querySelector<HTMLInputElement>(
      'input[name="modifications"]',
    )!;
    await waitFor(() =>
      expect(JSON.parse(input.value)).toEqual([
        { page: "0", modifications: [{ type: "rotate", angle: "cc" }] },
        { page: `1-${document.page_count - 1}`, modifications: [] },
      ]),
    );
  });

  describe("Discard", () => {
    it("leaves without asking when there are no edits", async () => {
      renderToolbar();

      await fireEvent.click(screen.getByTitle("Discard"));

      expect(window.confirm).not.toHaveBeenCalled();
      expect(goto).toHaveBeenCalledWith(documentHref);
    });

    it("returns to the grid from bulk edit", async () => {
      renderToolbar("bulk");

      await fireEvent.click(screen.getByTitle("Discard"));

      expect(goto).toHaveBeenCalledWith(gridHref);
    });

    it("keeps the edits when the user cancels the warning", async () => {
      vi.mocked(window.confirm).mockReturnValue(false);
      const { viewer } = renderToolbar();
      rotateFirstPage(viewer);

      await fireEvent.click(screen.getByTitle("Discard"));

      expect(window.confirm).toHaveBeenCalled();
      expect(viewer.history.hasEntries).toBe(true);
      expect(goto).not.toHaveBeenCalled();
    });

    it("drops the edits and leaves once the user confirms", async () => {
      vi.mocked(window.confirm).mockReturnValue(true);
      const { viewer } = renderToolbar();
      rotateFirstPage(viewer);

      await fireEvent.click(screen.getByTitle("Discard"));

      expect(viewer.history.hasEntries).toBe(false);
      expect(goto).toHaveBeenCalledWith(documentHref);
    });
  });

  describe("Save", () => {
    it("reloads the document and leaves edit mode on success", async () => {
      renderToolbar();

      const { button } = await submit({ type: "success" });

      expect(button).toBeDisabled();
      expect(invalidate).toHaveBeenCalledWith(`document:${document.id}`);
      expect(goto).toHaveBeenCalledWith(documentHref);
    });

    it("stays in edit mode when the save fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      renderToolbar();

      await submit({ type: "failure" });

      expect(invalidate).not.toHaveBeenCalled();
      expect(goto).not.toHaveBeenCalled();
    });
  });
});
