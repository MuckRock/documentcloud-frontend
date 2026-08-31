/**
 * Behavioral tests for Zoom, rendered through the real ViewerContext provider
 * (via renderInViewer) so they exercise the viewer's public interface rather
 * than its internal state plumbing — and survive the stores -> ViewerState
 * migration unchanged.
 *
 * Only genuinely external dependencies are mocked: pdfjs (network) and the
 * SvelteKit router.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { readable } from "svelte/store";

// pdfjs would hit the network when ViewerContext mounts and loads the PDF.
vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  GlobalWorkerOptions: { workerSrc: "mock-worker" },
  getDocument: vi.fn(() => ({
    promise: new Promise(() => {}),
    onProgress: null,
  })),
}));

const DOC_URL = "https://www.documentcloud.org/documents/2622-doc/";

// Zoom reads `page.url` to pick up an initial zoom from the query string, so
// keep it mutable: it's the only way a test can seed a starting zoom (Zoom's
// own effect overwrites whatever ViewerContext seeded).
const { pageUrl } = vi.hoisted(() => ({ pageUrl: { current: "" } }));

// ViewerContext reads the page store; Zoom reads it for the initial zoom.
vi.mock("$app/stores", () => ({
  page: readable({ url: new URL(DOC_URL) }),
}));
vi.mock("$app/state", () => ({
  page: {
    get url() {
      return new URL(pageUrl.current);
    },
  },
}));
vi.mock("$app/navigation", () => ({ afterNavigate: vi.fn() }));

import Zoom from "../Zoom.svelte";
import { renderInViewer } from "./renderInViewer";
import { document } from "@/test/fixtures/documents";

/** `value` attributes of the zoom <select>'s options, in order. */
function optionValues() {
  const select = screen.getByRole("combobox");
  return Array.from(
    select.querySelectorAll("option"),
    (o) => (o as HTMLOptionElement).value,
  );
}

const zoomIn = () => screen.getByRole("button", { name: "Zoom In" });
const zoomOut = () => screen.getByRole("button", { name: "Zoom Out" });

/** Render Zoom with an optional `?zoom=` seeding the starting zoom level. */
function renderZoom(mode: string, zoom?: string) {
  const url = new URL(DOC_URL);
  if (zoom !== undefined) url.searchParams.set("zoom", zoom);
  pageUrl.current = url.href;

  return renderInViewer(Zoom, { context: { document, mode: mode as any } });
}

beforeEach(() => {
  pageUrl.current = DOC_URL;
});

describe("Zoom", () => {
  it("offers auto fit plus percentages in document mode", () => {
    renderZoom("document");

    expect(optionValues()).toEqual([
      "auto",
      "0.5",
      "0.75",
      "1",
      "1.25",
      "1.5",
      "2",
    ]);
  });

  it("defaults to auto in document mode", () => {
    renderZoom("document");
    expect(screen.getByRole("combobox")).toHaveValue("auto");
  });

  it("shows the resolved percentage alongside the auto option", () => {
    renderZoom("document");
    // Zoom renders standalone here, so no width is measured and auto resolves
    // to 100% — the point is that the option reports a concrete percentage.
    expect(
      screen.getByRole("option", { name: /Auto \(100%\)/ }),
    ).toBeInTheDocument();
  });

  it("labels the select for screen readers without showing the text", () => {
    renderZoom("document");
    expect(screen.getByLabelText("Zoom")).toBe(screen.getByRole("combobox"));
  });

  it("offers only size presets in grid mode and defaults to small", () => {
    renderZoom("grid");

    expect(optionValues()).toEqual(["thumbnail", "small", "normal", "large"]);
    expect(screen.getByRole("combobox")).toHaveValue("small");
  });

  it("renders no control in notes mode (notes don't zoom)", () => {
    renderZoom("notes");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  describe("zoom in/out buttons", () => {
    it("steps up to the next level and syncs the select", async () => {
      const user = userEvent.setup();
      renderZoom("document", "1");

      await user.click(zoomIn());

      expect(screen.getByRole("combobox")).toHaveValue("1.25");
    });

    it("steps down to the previous level and syncs the select", async () => {
      const user = userEvent.setup();
      renderZoom("document", "1");

      await user.click(zoomOut());

      expect(screen.getByRole("combobox")).toHaveValue("0.75");
    });

    it("steps away from auto using the resolved scale", async () => {
      const user = userEvent.setup();
      renderZoom("document");

      // auto resolves to 100% here, so zooming in lands on 125%
      expect(screen.getByRole("combobox")).toHaveValue("auto");
      await user.click(zoomIn());

      expect(screen.getByRole("combobox")).toHaveValue("1.25");
    });

    it("disables zoom out at the smallest level", () => {
      renderZoom("document", "0.5");

      expect(zoomOut()).toBeDisabled();
      expect(zoomIn()).toBeEnabled();
    });

    it("disables zoom in at the largest level", () => {
      renderZoom("document", "2");

      expect(zoomIn()).toBeDisabled();
      expect(zoomOut()).toBeEnabled();
    });

    it("steps through the size presets in grid mode", async () => {
      const user = userEvent.setup();
      renderZoom("grid");

      expect(screen.getByRole("combobox")).toHaveValue("small");

      await user.click(zoomIn());
      expect(screen.getByRole("combobox")).toHaveValue("normal");

      await user.click(zoomOut());
      expect(screen.getByRole("combobox")).toHaveValue("small");
    });

    it("disables both ends of the grid presets", async () => {
      const user = userEvent.setup();
      renderZoom("grid", "thumbnail");

      expect(zoomOut()).toBeDisabled();

      await user.click(zoomIn());
      await user.click(zoomIn());
      await user.click(zoomIn());

      expect(screen.getByRole("combobox")).toHaveValue("large");
      expect(zoomIn()).toBeDisabled();
    });
  });
});
