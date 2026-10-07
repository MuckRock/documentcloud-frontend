/**
 * A PDF page must release what it allocated when the virtualizer unmounts it,
 * or memory grows with every page scrolled past.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import { readable } from "svelte/store";

const { getDocument, textLayers } = vi.hoisted(() => ({
  getDocument: vi.fn(),
  textLayers: [] as { cancel: () => void }[],
}));

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => {
  class BaseException extends Error {
    constructor(msg: string, name: string) {
      super(msg);
      this.name = name;
    }
  }
  return {
    GlobalWorkerOptions: { workerSrc: "mock-worker" },
    PDFDataRangeTransport: class {},
    getDocument,
    TextLayer: class {
      cancel = vi.fn();
      update = vi.fn();
      render = vi.fn(() => Promise.resolve());
      constructor() {
        textLayers.push(this);
      }
    },
    RenderingCancelledException: class extends BaseException {
      constructor(msg: string) {
        super(msg, "RenderingCancelledException");
      }
    },
    AbortException: class extends BaseException {
      constructor(msg: string) {
        super(msg, "AbortException");
      }
    },
  };
});
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

import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import PDFPage from "../PDFPage.svelte";
import { renderInViewer } from "./renderInViewer";
import { document } from "@/test/fixtures/documents";

/** A fake pdf.js page whose render settles only when the test says so. */
function makePage() {
  const render = Promise.withResolvers<void>();
  const renderTask = {
    promise: render.promise,
    cancel: vi.fn(() =>
      render.reject(
        new pdfjs.RenderingCancelledException("Rendering cancelled"),
      ),
    ),
  };
  return {
    view: [0, 0, 612, 792],
    getViewport: vi.fn(() => ({ width: 612, height: 792 })),
    render: vi.fn(() => renderTask),
    getTextContent: vi.fn(() => Promise.resolve({ items: [], styles: {} })),
    cleanup: vi.fn(),
    renderTask,
    finishRender: () => render.resolve(),
  };
}

function renderPage() {
  return renderInViewer(PDFPage, {
    props: { page_number: 1, scale: 1, width: 612, height: 792 },
    context: { document, mode: "document" },
  });
}

describe("PDFPage", () => {
  let page: ReturnType<typeof makePage>;

  beforeEach(() => {
    textLayers.length = 0;
    page = makePage();
    getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn(() => Promise.resolve(page)),
      }),
      onProgress: null,
    });

    // Report every page as onscreen. The callback must be async, like a real
    // observer's, or the page reads the placeholder PDF before loading starts.
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(private callback: IntersectionObserverCallback) {}
        observe(el: Element) {
          queueMicrotask(() =>
            this.callback(
              [
                {
                  isIntersecting: true,
                  target: el,
                  boundingClientRect: el.getBoundingClientRect(),
                  rootBounds: null,
                } as unknown as IntersectionObserverEntry,
              ],
              this as unknown as IntersectionObserver,
            ),
          );
        }
        unobserve() {}
        disconnect() {}
      },
    );
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      {} as CanvasRenderingContext2D,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("releases its pdf.js page when it unmounts", async () => {
    const { unmount } = renderPage();
    await waitFor(() => expect(page.render).toHaveBeenCalled());
    page.finishRender();

    unmount();

    await waitFor(() => expect(page.cleanup).toHaveBeenCalled());
  });

  it("cancels a render still in progress when it unmounts", async () => {
    const { unmount } = renderPage();
    await waitFor(() => expect(page.render).toHaveBeenCalled());

    unmount();

    expect(page.renderTask.cancel).toHaveBeenCalled();
  });

  it("cancels its text layer when it unmounts", async () => {
    const { unmount } = renderPage();
    await waitFor(() => expect(textLayers).toHaveLength(1));

    unmount();

    expect(textLayers[0]!.cancel).toHaveBeenCalled();
  });

  it("frees its canvas bitmap when it unmounts", async () => {
    const { container, unmount } = renderPage();
    await waitFor(() => expect(page.render).toHaveBeenCalled());
    const canvas = container.querySelector("canvas")!;
    expect(canvas.width).toBeGreaterThan(0);

    unmount();

    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
  });
});
