/**
 * Behavioral tests for the Text viewer pane, rendered through the real
 * ViewerContext provider via renderInViewer.
 *
 * Text renders each page inside <Page track>, which sets up an
 * IntersectionObserver — stubbed here since jsdom lacks it. pdfjs (network)
 * and the router are mocked as elsewhere.
 */
import type { DocumentText } from "$lib/api/types";

import { describe, it, expect, vi, beforeAll } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
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
vi.mock("$app/state", () => ({
  page: {
    url: new URL("https://www.documentcloud.org/documents/2622-doc/"),
  },
}));
vi.mock("$app/navigation", () => ({ afterNavigate: vi.fn() }));

// Page uses IntersectionObserver when tracking visibility.
beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

import Text from "../Text.svelte";
import { renderInViewer } from "./renderInViewer";
import { document } from "@/test/fixtures/documents";
import textFixture from "@/test/fixtures/documents/document.txt.json";

const text = textFixture as DocumentText; // 3 pages of real OCR text

describe("Text", () => {
  it("renders a text block for each page once the text resolves", async () => {
    const { container } = renderInViewer(Text, {
      context: { document, mode: "text", text: Promise.resolve(text) },
    });

    await waitFor(() =>
      expect(container.querySelectorAll("pre")).toHaveLength(text.pages.length),
    );
    // page 0 of the fixture is Joan Didion's "The Santa Anas"
    expect(screen.getByText(/Joan Didion/)).toBeInTheDocument();
  });

  it("exposes the zoom level as the --zoom custom property", async () => {
    const { container } = renderInViewer(Text, {
      context: {
        document,
        mode: "text",
        zoom: 1.5,
        text: Promise.resolve(text),
      },
    });

    await waitFor(() =>
      expect(screen.getByText(/Joan Didion/)).toBeInTheDocument(),
    );

    const pages = container.querySelector(".textPages") as HTMLElement;
    expect(pages.style.getPropertyValue("--zoom")).toBe("1.5");
  });
});
