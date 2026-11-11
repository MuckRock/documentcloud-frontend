/**
 * Unit tests for the ViewerState class.
 *
 * Uses the .svelte.ts extension so Svelte rune syntax ($state) inside the class
 * under test is compiled. `pdfjs` and the documents API are mocked so `loadPDF`
 * can be exercised without touching the network.
 */
import type { Document } from "$lib/api/types";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";

// `vi.mock` factories are hoisted above the file, so the mocks they reference
// must be created with `vi.hoisted`.
const { getDocument, assetUrl, openSignedRange, pdfModified } = vi.hoisted(
  () => ({
    getDocument: vi.fn(),
    assetUrl: vi.fn(),
    openSignedRange: vi.fn(),
    pdfModified: vi.fn(async (): Promise<string | null> => null),
  }),
);
vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  // truthy workerSrc so the module-init guard skips `new URL(...)`
  GlobalWorkerOptions: { workerSrc: "mock-worker" },
  getDocument,
}));
vi.mock("$lib/api/documents", () => ({ assetUrl }));
vi.mock("$lib/utils/pdfRange", () => ({ openSignedRange }));
vi.mock("$lib/utils/pdfModified", () => ({ pdfModified }));

import { ViewerState } from "$lib/state/viewer.svelte";
import { PT_TO_PX } from "$lib/utils/pageSize";
import { Page } from "$lib/utils/page.svelte";
import {
  clearPendingLayout,
  savePendingLayout,
} from "$lib/state/pendingLayout";
import documentFixture from "@/test/fixtures/documents/document.json";

const doc = documentFixture as unknown as Document;

/** A fake pdfjs loading task with a controllable promise. */
function makeTask(promise: Promise<unknown>) {
  return { promise, onProgress: null as unknown, destroy: vi.fn() };
}

// The unrecoverable-error path re-throws inside a `.catch`, producing an
// intentionally floating rejection that mirrors production. Swallow it so it
// doesn't fail unrelated assertions.
const swallow = () => {};
beforeAll(() => process.on("unhandledRejection", swallow));
afterAll(() => process.off("unhandledRejection", swallow));

describe("ViewerState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has sensible defaults", () => {
    const v = new ViewerState();
    expect(v.document).toBeNull();
    expect(v.mode).toBe("document");
    expect(v.page).toBe(1);
    expect(v.zoom).toBe(1);
    expect(v.embed).toBe(false);
    expect(v.errors).toEqual([]);
    expect(v.currentNote).toBeNull();
    expect(v.newNote).toBeNull();
    expect(v.progress).toEqual({ loaded: 0, total: 0 });
    // the viewport width is only known once the PDF pane has laid out
    expect(v.width).toBeUndefined();
    expect(v.pages).toEqual([]);
  });

  it("loadingProgress guards against a zero total", () => {
    const v = new ViewerState();
    expect(v.loadingProgress).toBe(0);
    v.progress = { loaded: 5, total: 0 };
    expect(v.loadingProgress).toBe(0);
  });

  it("loadingProgress reports the loaded ratio", () => {
    const v = new ViewerState();
    v.progress = { loaded: 3, total: 12 };
    expect(v.loadingProgress).toBe(0.25);
  });

  it("loadPDF stores the pdf promise and wires progress updates", async () => {
    const pdf = { numPages: 7 };
    const task = makeTask(Promise.resolve(pdf));
    getDocument.mockReturnValue(task);

    const v = new ViewerState();
    const url = new URL("https://example.com/doc.pdf");
    v.loadPDF(url);

    expect(getDocument).toHaveBeenCalledWith(expect.objectContaining({ url }));
    await expect(v.pdf).resolves.toBe(pdf);

    // the class installs its own onProgress handler on the task
    (task.onProgress as (p: unknown) => void)({ loaded: 4, total: 8 });
    expect(v.progress).toEqual({ loaded: 4, total: 8 });
  });

  it("loadingProgress is complete once the PDF opens, even with only part of the file loaded", async () => {
    const task = makeTask(Promise.resolve({ numPages: 7 }));
    getDocument.mockReturnValue(task);

    const v = new ViewerState();
    v.loadPDF(new URL("https://example.com/doc.pdf"));
    (task.onProgress as (p: unknown) => void)({ loaded: 1, total: 100 });
    await v.pdf;

    expect(v.loadingProgress).toBe(1);
  });

  it("loadPDF fetches only the byte ranges pdf.js needs, not the whole file", () => {
    getDocument.mockReturnValue(makeTask(Promise.resolve({})));
    const v = new ViewerState();
    v.loadPDF(new URL("https://example.com/doc.pdf"));

    expect(getDocument).toHaveBeenCalledWith(
      expect.objectContaining({ disableAutoFetch: true, disableStream: true }),
    );
  });

  describe("loadPDF for a private document", () => {
    const privateDoc = { ...doc, access: "private" } as Document;
    const signedUrl = new URL("https://s3.example.com/doc.pdf?sig=1");

    it("loads by byte range through a transport that re-signs its URL", async () => {
      const transport = {};
      openSignedRange.mockResolvedValue(transport);
      getDocument.mockReturnValue(makeTask(Promise.resolve({})));
      const freshUrl = new URL("https://s3.example.com/doc.pdf?sig=2");
      assetUrl.mockResolvedValue(freshUrl);

      const v = new ViewerState();
      v.document = privateDoc;
      v.loadPDF(signedUrl);

      await vi.waitFor(() =>
        expect(getDocument).toHaveBeenCalledWith(
          expect.objectContaining({ range: transport }),
        ),
      );
      const [url, refresh] = openSignedRange.mock.calls[0]!;
      expect(url).toBe(signedUrl);
      await expect(refresh()).resolves.toBe(freshUrl);
      expect(assetUrl).toHaveBeenCalledWith(privateDoc);
    });

    it("falls back to loading by URL when the server won't serve ranges", async () => {
      openSignedRange.mockResolvedValue(null);
      getDocument.mockReturnValue(makeTask(Promise.resolve({})));

      const v = new ViewerState();
      v.document = privateDoc;
      v.loadPDF(signedUrl);

      await vi.waitFor(() =>
        expect(getDocument).toHaveBeenCalledWith(
          expect.objectContaining({ url: signedUrl }),
        ),
      );
      expect(openSignedRange).toHaveBeenCalledWith(
        signedUrl,
        expect.any(Function),
      );
    });

    it("records a range that can't be fetched as an error", async () => {
      const transport: { onError?: (e: unknown) => void } = {};
      openSignedRange.mockResolvedValue(transport);
      getDocument.mockReturnValue(makeTask(Promise.resolve({})));

      const v = new ViewerState();
      v.document = privateDoc;
      v.loadPDF(signedUrl);
      await vi.waitFor(() => expect(getDocument).toHaveBeenCalled());

      const error = new Error("Range request failed: 500");
      transport.onError?.(error);
      expect(v.errors).toContain(error);
    });

    it("only starts one load when called again while opening", async () => {
      openSignedRange.mockResolvedValue({});
      getDocument.mockReturnValue(makeTask(Promise.resolve({})));

      const v = new ViewerState();
      v.document = privateDoc;
      v.loadPDF(signedUrl);
      v.loadPDF(signedUrl);
      await vi.waitFor(() => expect(getDocument).toHaveBeenCalled());

      expect(openSignedRange).toHaveBeenCalledTimes(1);
      expect(getDocument).toHaveBeenCalledTimes(1);
    });
  });

  it("loadPDF is a no-op while a task is already in flight", () => {
    getDocument.mockReturnValue(makeTask(Promise.resolve({})));
    const v = new ViewerState();
    v.loadPDF(new URL("https://example.com/a.pdf"));
    v.loadPDF(new URL("https://example.com/b.pdf"));
    expect(getDocument).toHaveBeenCalledTimes(1);
  });

  it("retries with a fresh asset URL on a 403", async () => {
    const err = Object.assign(new Error("Forbidden"), { status: 403 });
    const firstTask = makeTask(Promise.reject(err));
    // keep the initial rejection from being flagged unhandled
    firstTask.promise.catch(() => {});
    const secondPdf = { numPages: 1 };
    const secondTask = makeTask(Promise.resolve(secondPdf));
    getDocument.mockReturnValueOnce(firstTask).mockReturnValueOnce(secondTask);

    const freshUrl = new URL("https://example.com/fresh.pdf");
    assetUrl.mockResolvedValue(freshUrl);

    const v = new ViewerState();
    v.document = doc;
    v.loadPDF(new URL("https://example.com/stale.pdf"));

    await vi.waitFor(() => expect(getDocument).toHaveBeenCalledTimes(2));
    expect(assetUrl).toHaveBeenCalledWith(doc);
    expect(getDocument).toHaveBeenLastCalledWith(
      expect.objectContaining({ url: freshUrl }),
    );
    await expect(v.pdf).resolves.toBe(secondPdf);
  });

  it("records non-403 errors instead of retrying", async () => {
    const err = Object.assign(new Error("boom"), { status: 500 });
    const task = makeTask(Promise.reject(err));
    task.promise.catch(() => {});
    getDocument.mockReturnValue(task);

    const v = new ViewerState();
    v.document = doc;
    v.loadPDF(new URL("https://example.com/a.pdf"));

    await vi.waitFor(() => expect(v.errors).toContain(err));
    expect(assetUrl).not.toHaveBeenCalled();
  });

  it("stops retrying 403s after 5 attempts", async () => {
    const err = Object.assign(new Error("Forbidden"), { status: 403 });
    getDocument.mockImplementation(() => {
      const t = makeTask(Promise.reject(err));
      t.promise.catch(() => {});
      return t;
    });
    assetUrl.mockResolvedValue(new URL("https://example.com/fresh.pdf"));

    const v = new ViewerState();
    v.document = doc;
    v.loadPDF(new URL("https://example.com/stale.pdf"));

    // 1 initial + 5 retries
    await vi.waitFor(() => expect(getDocument).toHaveBeenCalledTimes(6));
    await vi.waitFor(() => expect(v.errors).toContain(err));
  });

  it("reloadPDF opens the new file even though a PDF is already loaded", () => {
    getDocument.mockReturnValue(makeTask(Promise.resolve({})));
    const v = new ViewerState();
    v.loadPDF(new URL("https://example.com/old.pdf"));
    v.reloadPDF(new URL("https://example.com/new.pdf"));

    expect(getDocument).toHaveBeenCalledTimes(2);
    expect(getDocument).toHaveBeenLastCalledWith(
      expect.objectContaining({ url: new URL("https://example.com/new.pdf") }),
    );
  });

  describe("pending modifications", () => {
    // Page 3 moved to the front and rotated, the rest deleted.
    const submitted = [
      new Page({ index: 2, width: 842, height: 595, rotation: 90 }),
    ];

    beforeEach(() => {
      clearPendingLayout(doc.id);
      savePendingLayout(doc, submitted, "original");
    });

    const layout = (v: ViewerState) =>
      v.pages.map(({ index, rotation }) => [index, rotation]);

    it("shows the submitted layout while the document processes", () => {
      const v = new ViewerState();
      v.document = { ...doc, status: "pending" };
      expect(layout(v)).toEqual([[2, 90]]);
    });

    it("shows the document's own pages once processing finishes", () => {
      const v = new ViewerState();
      v.document = { ...doc, status: "pending" };
      v.document = { ...doc, status: "success", page_spec: "842.0x595.0:0" };
      expect(layout(v)).toEqual([[0, 0]]);
    });

    it("versions page images by the pre-save updated_at while processing", () => {
      const v = new ViewerState();
      v.document = {
        ...doc,
        status: "pending",
        updated_at: "2030-01-01T00:00:00Z",
      };
      expect(v.imageVersion).toBe(doc.updated_at);
    });

    it("versions page images by the document's updated_at once processed", () => {
      const v = new ViewerState();
      const updated_at = "2030-01-01T00:00:00Z";
      v.document = { ...doc, status: "success", updated_at };
      expect(v.imageVersion).toBe(updated_at);
    });

    const openPdf = async (modified: string) => {
      getDocument.mockReturnValue(makeTask(Promise.resolve({})));
      pdfModified.mockResolvedValueOnce(modified);
      const v = new ViewerState();
      v.document = { ...doc, status: "pending", edit_access: true };
      v.loadPDF(new URL("https://example.com/doc.pdf"));
      await v.pdf;
      return v;
    };

    it("applies the submitted layout to the PDF it was built from", async () => {
      const v = await openPdf("original");
      expect(v.hasPendingLayout).toBe(false);
    });

    it("treats a PDF processing already rewrote as having the layout baked in", async () => {
      const v = await openPdf("rewritten");
      expect(v.hasPendingLayout).toBe(true);
    });

    it("ignores a submitted layout built from a different page spec", () => {
      const v = new ViewerState();
      v.document = { ...doc, status: "pending", page_spec: "612.0x792.0:0-1" };
      expect(layout(v)).toEqual([
        [0, 0],
        [1, 0],
      ]);
    });
  });

  describe("selectPage", () => {
    function viewer() {
      const v = new ViewerState();
      v.document = doc;
      return v;
    }

    const click = (v: ViewerState, index: number, shift = false) =>
      v.selectPage(v.pages[index]!.id, shift);

    const selected = (v: ViewerState) =>
      v.pages.flatMap(({ id }, i) => (v.selectedPages.has(id) ? [i] : []));

    it("selects a page, and deselects it when clicked again", () => {
      const v = viewer();

      click(v, 2);
      expect(selected(v)).toEqual([2]);

      click(v, 2);
      expect(selected(v)).toEqual([]);
    });

    it("adds pages one at a time without shift", () => {
      const v = viewer();

      click(v, 1);
      click(v, 4);

      expect(selected(v)).toEqual([1, 4]);
    });

    it("selects only the shift-clicked page when nothing is selected", () => {
      const v = viewer();

      click(v, 3, true);

      expect(selected(v)).toEqual([3]);
    });

    it("selects through a later page from the last selected page on shift-click", () => {
      const v = viewer();

      click(v, 0);
      click(v, 2);
      click(v, 5, true);

      expect(selected(v)).toEqual([0, 2, 3, 4, 5]);
    });

    it("selects back to the first selected page on shift-click of an earlier page", () => {
      const v = viewer();

      click(v, 4);
      click(v, 6);
      click(v, 1, true);

      expect(selected(v)).toEqual([1, 2, 3, 4, 6]);
    });

    it("fills in from the first selected page on shift-click inside the selection", () => {
      const v = viewer();

      click(v, 1);
      click(v, 5);
      click(v, 3, true);

      expect(selected(v)).toEqual([1, 2, 3, 5]);
    });

    it("deselects only a selected page on shift-click", () => {
      const v = viewer();

      click(v, 1);
      click(v, 4, true);
      click(v, 2, true);

      expect(selected(v)).toEqual([1, 3, 4]);
    });
  });

  // Zoom is computed here rather than per-page so every page in the document
  // renders at one uniform scale. The fixture's page_spec is
  // "595.0x842.0:0-6" — seven A4 pages 595pt wide.
  describe("zoom", () => {
    const PAGE_WIDTH = 595 * PT_TO_PX;
    const PAGE_HEIGHT = 842 * PT_TO_PX;

    /** A viewer showing the fixture document, laid out at `width` px. */
    function viewerWithWidth(width?: number) {
      const v = new ViewerState();
      v.document = doc;
      v.width = width;
      return v;
    }

    it("derives pages from the document's page_spec", () => {
      const v = viewerWithWidth();
      expect(v.pages).toHaveLength(doc.page_count);
      expect(
        v.pages.every(
          ({ width, height }) => width === PAGE_WIDTH && height === PAGE_HEIGHT,
        ),
      ).toBe(true);
    });

    it("derives no pages when the document has no page_spec", () => {
      const v = new ViewerState();
      v.document = { ...doc, page_spec: undefined } as Document;
      expect(v.pages).toEqual([]);
    });

    it("allows pages to be overridden when page_spec is missing", () => {
      // PDF.svelte falls back to placeholder pages from the pdfjs page count
      const v = new ViewerState();
      v.document = { ...doc, page_spec: undefined } as Document;
      v.pages = [0, 1, 2].map(
        (index) => new Page({ index, width: 0, height: 0 }),
      );
      expect(
        v.pages.map(({ index, width, height }) => [index, width, height]),
      ).toEqual([
        [0, 0, 0],
        [1, 0, 0],
        [2, 0, 0],
      ]);
    });

    it("autoZoomScale is 1 until the viewport width is measured", () => {
      expect(viewerWithWidth(undefined).autoZoomScale).toBe(1);
      // a zero width means the pane hasn't laid out yet, not "infinitely small"
      expect(viewerWithWidth(0).autoZoomScale).toBe(1);
    });

    it("autoZoomScale shrinks the document to fit a narrow viewport", () => {
      expect(viewerWithWidth(PAGE_WIDTH / 2).autoZoomScale).toBe(0.5);
      expect(viewerWithWidth(PAGE_WIDTH).autoZoomScale).toBe(1);
    });

    it("autoZoomScale never enlarges past the intrinsic page size", () => {
      // a wide viewport caps at 100% rather than blowing the pages up
      expect(viewerWithWidth(PAGE_WIDTH * 4).autoZoomScale).toBe(1);
    });

    it("autoZoomScale fits the widest page in a mixed-size document", () => {
      // one landscape page twice as wide as the rest drives the scale
      const v = new ViewerState();
      v.document = { ...doc, page_spec: "595x842:0-5;1190x842:6" } as Document;
      v.width = PAGE_WIDTH;
      expect(v.autoZoomScale).toBe(0.5);
    });

    it("scale uses a numeric zoom verbatim", () => {
      const v = viewerWithWidth(PAGE_WIDTH / 2);
      v.zoom = 1.5;
      expect(v.scale).toBe(1.5);
      v.zoom = 0.75;
      expect(v.scale).toBe(0.75);
    });

    it("scale follows autoZoomScale when zoom is 'auto'", () => {
      const v = viewerWithWidth(PAGE_WIDTH / 2);
      v.zoom = "auto";
      expect(v.scale).toBe(0.5);
    });

    it("scale recomputes when the viewport is resized in 'auto'", () => {
      const v = viewerWithWidth(PAGE_WIDTH / 2);
      v.zoom = "auto";
      expect(v.scale).toBe(0.5);

      v.width = PAGE_WIDTH / 4;
      expect(v.scale).toBe(0.25);

      // ...but a fixed zoom ignores the viewport entirely
      v.zoom = 1;
      expect(v.scale).toBe(1);
    });

    it("scale falls back to 1 for a non-numeric, non-auto zoom", () => {
      // grid mode uses size names ("small"), which don't map to a PDF scale
      const v = viewerWithWidth(PAGE_WIDTH / 2);
      v.zoom = "small";
      expect(v.scale).toBe(1);
    });
  });
});
