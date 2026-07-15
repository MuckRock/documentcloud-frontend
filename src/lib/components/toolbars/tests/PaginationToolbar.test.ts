/**
 * Behavioral tests for PaginationToolbar, rendered through the real
 * ViewerContext provider via renderInViewer. This is the main writer of the
 * viewer's current-page state, so the test drives next/previous and asserts
 * the displayed page follows.
 *
 * Only external dependencies are mocked: pdfjs (network) and the router.
 */
import type { Document } from "$lib/api/types";

import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/svelte";
import { readable } from "svelte/store";

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  GlobalWorkerOptions: { workerSrc: "mock-worker" },
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
// PaginationToolbar calls replaceState; ViewerContext registers afterNavigate.
const { replaceState } = vi.hoisted(() => ({ replaceState: vi.fn() }));
vi.mock("$app/navigation", () => ({
  replaceState,
  afterNavigate: vi.fn(),
}));

import PaginationToolbar from "../PaginationToolbar.svelte";
import { renderInViewer } from "../../viewer/tests/renderInViewer";
import documentFixture from "@/test/fixtures/documents/document.json";

const document = documentFixture as unknown as Document; // page_count: 7

const pageInput = () => screen.getByRole("spinbutton") as HTMLInputElement;

describe("PaginationToolbar", () => {
  it("starts on page 1 with previous disabled and next enabled", () => {
    renderInViewer(PaginationToolbar, {
      context: { document, mode: "document", page: 1 },
    });

    expect(pageInput()).toHaveValue(1);
    expect(screen.getByTitle("Previous Page")).toBeDisabled();
    expect(screen.getByTitle("Next Page")).toBeEnabled();
    // total page count is shown
    expect(screen.getByText(/of\s+7/)).toBeInTheDocument();
  });

  it("advances the page when Next is clicked", async () => {
    renderInViewer(PaginationToolbar, {
      context: { document, mode: "document", page: 1 },
    });

    await fireEvent.click(screen.getByTitle("Next Page"));

    expect(pageInput()).toHaveValue(2);
    expect(replaceState).toHaveBeenCalled();
  });

  it("disables Next on the last page", () => {
    renderInViewer(PaginationToolbar, {
      context: { document, mode: "document", page: 7 },
    });

    expect(pageInput()).toHaveValue(7);
    expect(screen.getByTitle("Next Page")).toBeDisabled();
    expect(screen.getByTitle("Previous Page")).toBeEnabled();
  });
});
