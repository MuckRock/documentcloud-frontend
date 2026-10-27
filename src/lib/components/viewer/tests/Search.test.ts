/**
 * Behavioral tests for the Search viewer pane, rendered through the real
 * ViewerContext provider via renderInViewer.
 *
 * The within-document search API is mocked (partial mock so ViewerContext's
 * other uses of $lib/api/documents keep working); pdfjs and the router are
 * mocked as elsewhere.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
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
    url: new URL("https://www.documentcloud.org/documents/2622-doc/?q=Boston"),
  }),
}));
vi.mock("$app/state", () => ({
  page: {
    url: new URL("https://www.documentcloud.org/documents/2622-doc/?q=Boston"),
  },
}));
vi.mock("$app/navigation", () => ({ afterNavigate: vi.fn() }));

const { searchWithin } = vi.hoisted(() => ({ searchWithin: vi.fn() }));
vi.mock("$lib/api/documents", async (orig) => ({
  ...(await orig<typeof import("$lib/api/documents")>()),
  searchWithin,
}));

import Search from "../Search.svelte";
import { renderInViewer } from "./renderInViewer";
import { stubViewport } from "@/test/helpers/stubViewport";
import {
  document,
  searchWithin as searchResults,
} from "@/test/fixtures/documents";

describe("Search", () => {
  beforeEach(() => stubViewport({ itemHeight: 150 }));

  it("lists result cards for the matching pages in view", async () => {
    searchWithin.mockResolvedValue({ data: searchResults });

    const { container } = renderInViewer(Search, {
      context: { document, mode: "search" },
    });

    await waitFor(() => {
      const count = container.querySelectorAll("a.card").length;
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(Object.keys(searchResults).length);
    });
    expect(searchWithin).toHaveBeenCalledWith(document.id, "Boston");
  });

  it("shows an empty state when there are no matches", async () => {
    searchWithin.mockResolvedValue({ data: {} });

    const { container } = renderInViewer(Search, {
      context: { document, mode: "search" },
    });

    await waitFor(() =>
      expect(screen.getByText(/no matching results/i)).toBeInTheDocument(),
    );
    expect(container.querySelectorAll("a.card")).toHaveLength(0);
  });
});
