import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { fireEvent, screen } from "@testing-library/svelte";
import { get, readable } from "svelte/store";

import type { ViewerState } from "$lib/state/viewer.svelte";

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

const { goto } = vi.hoisted(() => ({ goto: vi.fn() }));
vi.mock("$app/navigation", () => ({ goto, afterNavigate: vi.fn() }));

// Pass the real provider through, keeping a handle on the state it creates.
const provided = vi.hoisted(() => ({ viewer: null as ViewerState | null }));
vi.mock("$lib/state/viewer.svelte", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("$lib/state/viewer.svelte")>();
  return {
    ...actual,
    setViewerState: (viewer: ViewerState) => {
      provided.viewer = viewer;
      return actual.setViewerState(viewer);
    },
  };
});

import SelectionToolbar from "../SelectionToolbar.svelte";
import { redactions } from "$lib/components/viewer/RedactionLayer.svelte";
import { renderInViewer } from "../../viewer/tests/renderInViewer";
import { document } from "@/test/fixtures/documents";
import { stubTextLayout } from "@/test/helpers/stubTextLayout";

describe("SelectionToolbar", () => {
  let unstub: () => void;
  beforeAll(() => (unstub = stubTextLayout()));
  afterAll(() => unstub());

  let pageRef: HTMLElement;

  // A 200x400 page with "Hello world" at y=40 and "again" at y=80.
  beforeEach(() => {
    goto.mockClear();
    redactions.set([]);
    window.getSelection()!.removeAllRanges();

    pageRef = window.document.createElement("div");
    pageRef.innerHTML =
      '<span data-box="20,40">Hello</span> <span data-box="80,40">world</span>' +
      '<span data-box="20,80">again</span>';
    window.document.body.append(pageRef);
    vi.spyOn(pageRef, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, 0, 200, 400),
    );

    return () => pageRef.remove();
  });

  function select(from: [number, number], to: [number, number]) {
    const words = [...pageRef.querySelectorAll("span")].map(
      (span) => span.firstChild!,
    );
    const range = window.document.createRange();
    range.setStart(words[from[0]]!, from[1]);
    range.setEnd(words[to[0]]!, to[1]);
    window.getSelection()!.addRange(range);
    return range;
  }

  function renderToolbar(
    selection: Range,
    context: Partial<Parameters<typeof renderInViewer>[1]["context"]> = {},
  ) {
    return renderInViewer(SelectionToolbar, {
      props: { selection, page_number: 2, pageRef },
      context: { document, loadPdf: false, ...context },
    });
  }

  it("offers to annotate or redact the selection to editors", () => {
    renderToolbar(select([0, 0], [1, 5]));

    expect(screen.getByRole("button", { name: "Annotate" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Redact" })).toBeVisible();
  });

  it("starts a note covering the selection, in page fractions", async () => {
    renderToolbar(select([0, 0], [1, 5]));

    await fireEvent.click(screen.getByRole("button", { name: "Annotate" }));

    expect(goto).toHaveBeenCalledWith(
      expect.stringContaining("mode=annotating"),
    );
    expect(provided.viewer!.newNote).toEqual({
      x1: 0.1,
      x2: 0.65,
      y1: 0.1,
      y2: 0.15,
      page_number: 2,
      title: "",
      content: "",
      access: "private",
    });
    expect(window.getSelection()!.rangeCount).toBe(0);
  });

  it("keeps a new note inside the page when the selection overflows it", async () => {
    pageRef.querySelector("span")!.dataset.box = "-20,-10";
    renderToolbar(select([0, 0], [1, 5]));

    await fireEvent.click(screen.getByRole("button", { name: "Annotate" }));

    const { x1, y1 } = provided.viewer!.newNote!;
    expect([x1, y1]).toEqual([0, 0]);
  });

  it("adds one redaction per selected line", async () => {
    renderToolbar(select([0, 0], [2, 5]));

    await fireEvent.click(screen.getByRole("button", { name: "Redact" }));

    expect(goto).toHaveBeenCalledWith(
      expect.stringContaining("mode=redacting"),
    );
    expect(get(redactions)).toEqual([
      {
        x1: expect.closeTo(19 / 200),
        x2: expect.closeTo(131 / 200),
        y1: expect.closeTo(39 / 400),
        y2: expect.closeTo(61 / 400),
        page_number: 2,
      },
      {
        x1: expect.closeTo(19 / 200),
        x2: expect.closeTo(71 / 200),
        y1: expect.closeTo(79 / 400),
        y2: expect.closeTo(101 / 400),
        page_number: 2,
      },
    ]);
    expect(window.getSelection()!.rangeCount).toBe(0);
  });

  it("keeps redactions already pending", async () => {
    const existing = { x1: 0, x2: 0.1, y1: 0, y2: 0.1, page_number: 0 };
    redactions.set([existing]);
    renderToolbar(select([1, 0], [1, 5]));

    await fireEvent.click(screen.getByRole("button", { name: "Redact" }));

    expect(get(redactions)).toHaveLength(2);
    expect(get(redactions)[0]).toEqual(existing);
  });
});
