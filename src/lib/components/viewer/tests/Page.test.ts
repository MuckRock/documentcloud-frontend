/**
 * Behavioral tests for the generic Page container, rendered through the real
 * ViewerContext provider via renderInViewer.
 *
 * Covers the page-number link and the embed gating of PageActions — the
 * `embed` read the migration must preserve. (The IntersectionObserver ->
 * currentPage write only happens with `track`, which isn't practical to drive
 * in jsdom, so it's left to e2e.)
 *
 * Only pdfjs (network) and the router are mocked.
 */
import { describe, it, expect, vi } from "vitest";
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

import Page from "../Page.svelte";
import { renderInViewer } from "./renderInViewer";
import { document } from "@/test/fixtures/documents";

describe("Page", () => {
  it("renders a page-number link", () => {
    const { container } = renderInViewer(Page, {
      props: { page_number: 3 },
      context: { document, mode: "document" },
    });

    const link = container.querySelector(".pageNumber a") as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.textContent).toContain("3");
    expect(link.getAttribute("href")).toBeTruthy();
  });

  it("renders page actions when not embedded", () => {
    const { container } = renderInViewer(Page, {
      props: { page_number: 1 },
      context: { document, mode: "document", embed: false },
    });

    expect(container.querySelector(".page-actions")).not.toBeNull();
  });

  it("omits page actions in embed mode", () => {
    const { container } = renderInViewer(Page, {
      props: { page_number: 1 },
      context: { document, mode: "document", embed: true },
    });

    expect(container.querySelector(".page-actions")).toBeNull();
  });
});
