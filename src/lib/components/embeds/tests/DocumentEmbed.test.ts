/**
 * DocumentEmbed is always an embed, so it declares `embed` on the shared viewer
 * state regardless of whether the ViewerContext provider was told `embed`. This
 * is the belt-and-suspenders guard: without it, an embed whose provider forgot
 * `embed` would build APP_URL links instead of EMBED_URL ones.
 *
 * <Viewer> is replaced with a probe that reports `viewer.embed`; only pdfjs and
 * the router are otherwise mocked.
 */
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/svelte";
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
  page: { url: new URL("https://www.documentcloud.org/documents/2622-doc/") },
}));
vi.mock("$app/navigation", () => ({ afterNavigate: vi.fn() }));

// Stand in for the heavy <Viewer> subtree with a probe that reads viewer.embed.
vi.mock("../../viewer/Viewer.svelte", () => import("./EmbedProbe.svelte"));

import DocumentEmbed from "../DocumentEmbed.svelte";
import { renderInViewer } from "../../viewer/tests/renderInViewer";
import { documentExpanded as document } from "@/test/fixtures/documents";

describe("DocumentEmbed", () => {
  it("declares embed on the viewer even when the provider wasn't told", () => {
    // note: no `embed` in the context — DocumentEmbed must set it itself
    renderInViewer(DocumentEmbed, {
      props: { settings: { title: 1 } },
      context: { document },
    });

    expect(screen.getByTestId("viewer-embed")).toHaveTextContent("true");
  });
});
