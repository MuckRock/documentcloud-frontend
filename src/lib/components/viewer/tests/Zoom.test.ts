/**
 * Behavioral tests for Zoom, rendered through the real ViewerContext provider
 * (via renderInViewer) so they exercise the viewer's public interface rather
 * than its internal state plumbing — and survive the stores -> ViewerState
 * migration unchanged.
 *
 * Only genuinely external dependencies are mocked: pdfjs (network) and the
 * SvelteKit router.
 */
import type { Document } from "$lib/api/types";

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/svelte";
import { readable } from "svelte/store";

// pdfjs would hit the network when ViewerContext mounts and loads the PDF.
vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  GlobalWorkerOptions: { workerSrc: "mock-worker" },
  getDocument: vi.fn(() => ({
    promise: new Promise(() => {}),
    onProgress: null,
  })),
}));

// ViewerContext reads the page store; Zoom reads it for the initial zoom.
vi.mock("$app/stores", () => ({
  page: readable({
    url: new URL("https://www.documentcloud.org/documents/2622-doc/"),
  }),
}));
vi.mock("$app/navigation", () => ({ afterNavigate: vi.fn() }));

import Zoom from "../Zoom.svelte";
import { renderInViewer } from "./renderInViewer";
import documentFixture from "@/test/fixtures/documents/document.json";

const document = documentFixture as unknown as Document;

/** `value` attributes of the zoom <select>'s options, in order. */
function optionValues() {
  const select = screen.getByRole("combobox");
  return Array.from(
    select.querySelectorAll("option"),
    (o) => (o as HTMLOptionElement).value,
  );
}

describe("Zoom", () => {
  it("offers width/height fit plus percentages in document mode", () => {
    renderInViewer(Zoom, { context: { document, mode: "document" } });

    expect(optionValues()).toEqual([
      "width",
      "height",
      "0.5",
      "0.75",
      "1",
      "1.25",
      "1.5",
      "2",
    ]);
  });

  it("defaults to fit-width in document mode", () => {
    renderInViewer(Zoom, { context: { document, mode: "document" } });
    expect(screen.getByRole("combobox")).toHaveValue("width");
  });

  it("offers only size presets in grid mode and defaults to small", () => {
    renderInViewer(Zoom, { context: { document, mode: "grid" } });

    expect(optionValues()).toEqual(["thumbnail", "small", "normal", "large"]);
    expect(screen.getByRole("combobox")).toHaveValue("small");
  });

  it("renders no control in notes mode (notes don't zoom)", () => {
    renderInViewer(Zoom, { context: { document, mode: "notes" } });
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
