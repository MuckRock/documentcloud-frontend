/**
 * NoteExcerpt renders the context around a note either from the loaded PDF or,
 * when the viewer has no PDF (a lightweight single-note embed), from a page
 * image. These tests pin that behavior so the embed stays lightweight:
 *
 * - `loadPdf: false` → render from a page image, never fetch the PDF.
 * - a loaded PDF     → render from the PDF.
 *
 * The two render paths (`renderImage` / `renderPDF`) are spied on so no real
 * canvas or network work happens; only pdfjs and the router are otherwise
 * mocked.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import { readable } from "svelte/store";

const { getDocument } = vi.hoisted(() => ({ getDocument: vi.fn() }));
vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  GlobalWorkerOptions: { workerSrc: "mock-worker" },
  getDocument,
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

const { renderImage, renderPDF } = vi.hoisted(() => ({
  renderImage: vi.fn(async () => {}),
  renderPDF: vi.fn(async () => {}),
}));
vi.mock("$lib/utils/notes", async (importOriginal) => ({
  ...(await importOriginal<typeof import("$lib/utils/notes")>()),
  renderImage,
  renderPDF,
}));

import NoteExcerpt from "../NoteExcerpt.svelte";
import { renderInViewer } from "../../viewer/tests/renderInViewer";
import { document } from "@/test/fixtures/documents";
import { note } from "@/test/fixtures/notes";

describe("NoteExcerpt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders from a page image and never fetches the PDF when the viewer has no PDF", async () => {
    renderInViewer(NoteExcerpt, {
      props: { document, note },
      context: { document, embed: true, loadPdf: false },
    });

    await waitFor(() => expect(renderImage).toHaveBeenCalled());
    expect(renderPDF).not.toHaveBeenCalled();
    // the whole point of a single-note embed: no document PDF is loaded
    expect(getDocument).not.toHaveBeenCalled();
  });

  it("renders from the loaded PDF when the viewer has one", async () => {
    const pdf = { getPage: vi.fn() };
    getDocument.mockReturnValue({
      promise: Promise.resolve(pdf),
      onProgress: null,
    });

    renderInViewer(NoteExcerpt, {
      props: { document, note },
      context: { document }, // loadPdf defaults to true
    });

    await waitFor(() => expect(renderPDF).toHaveBeenCalled());
    expect(renderImage).not.toHaveBeenCalled();
  });
});
