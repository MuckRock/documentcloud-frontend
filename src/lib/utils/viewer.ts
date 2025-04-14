import type {
  Document,
  Note,
  Section,
  Sizes,
  ViewerMode,
  Zoom,
} from "$lib/api/types";

import { canonicalUrl, embedUrl, pageHashUrl } from "../api/documents";
import { noteHashUrl } from "../api/notes";
import { IMAGE_WIDTHS_MAP } from "@/config/config.js";

interface ViewerHrefOptions {
  document?: Document;
  page?: number;
  note?: Note;
  mode?: ViewerMode;
  embed?: boolean;
  query?: string;
}

export function getViewerHref(options: ViewerHrefOptions = {}) {
  const {
    document,
    page,
    note,
    query,
    mode = "document",
    embed = false,
  } = options;

  let hash = "";
  if (page) hash = pageHashUrl(page);
  if (note) hash = noteHashUrl(note);

  const params = { mode };
  if (embed) params["embed"] = 1;
  if (query) params["q"] = query;

  if (document) {
    // If we have the document, we can provide an absolute URL
    let url = embed ? canonicalUrl(document) : embedUrl(document);
    url.search = new URLSearchParams(params).toString();
    if (hash) url.hash = hash;
    return url.href;
  } else {
    // If we don't, we can provide a relative URL
    let href = "?" + new URLSearchParams(params).toString();
    if (hash) href += hash;
    return href;
  }
}

/**
 * Return a numeric scale based on intrinsic page size and container size
 * @param width Original document width
 * @param height Original document height
 * @param container
 * @param scale
 */
export function fitPage(
  width: number,
  height: number,
  container: HTMLElement | undefined,
  scale: number | "width" | "height",
): number {
  if (typeof scale === "number") return scale;
  if (!container) return 1;

  // const [x1, y1, width, height] = page.view;
  const { clientWidth, clientHeight } = container;

  return scale === "width" ? clientWidth / width : clientHeight / height;
}

/**
 * Parse page_spec into width and height of each page
 *
 * @param pageSpec A string encoding page dimensions in a compact format
 * @returns an array of [width, height] tuples
 */
export function pageSizes(pageSpec: string): [width: number, height: number][] {
  // Handle empty page spec
  if (pageSpec.trim().length == 0) return [];

  const parts = pageSpec.split(";");
  return parts.reduce((sizes, part) => {
    const [size, range] = part?.split(":");
    const [width, height] = size?.split("x").map(parseFloat) ?? [];

    range?.split(",").forEach((rangePart) => {
      if (rangePart.includes("-")) {
        const [start, end] = rangePart.split("-").map((x) => parseInt(x, 10));
        for (let page = start ?? 0; page <= (end ?? 0); page++) {
          sizes[page] = [width, height];
        }
      } else {
        const page = parseInt(rangePart, 10);
        sizes[page] = [width, height];
      }
    });

    return sizes;
  }, Array(parts.length));
}

/**
 * Index notes by page
 */
export function getNotes(document: Document): Record<number, Note[]> {
  return (
    document.notes?.reduce<Record<number, Note[]>>((m, note) => {
      m[note.page_number] = (m[note.page_number] ?? []).concat(note);
      return m;
    }, {}) ?? {}
  );
}

/**
 * Index sections by page
 */
export function getSections(document: Document): Record<number, Section> {
  return (
    document.sections?.reduce((m, section) => {
      m[section.page_number] = section;
      return m;
    }, {}) ?? {}
  );
}

// for typescript
export function zoomToScale(zoom: any): number | "width" | "height" {
  if (zoom === "width" || zoom === "height") {
    return zoom;
  }

  return +zoom || 1;
}

export function zoomToSize(zoom: any): Sizes {
  if (IMAGE_WIDTHS_MAP.has(zoom)) {
    return zoom;
  }

  return "small";
}

/**
 * Generate a default zoom, based on mode
 * @param mode
 */
export function getDefaultZoom(mode: ViewerMode): Zoom {
  switch (mode) {
    case "document":
      return "width";

    case "annotating":
      return "width";

    case "redacting":
      return "width";

    case "grid":
      return "small";

    default:
      return 1;
  }
}

/**
 * Generate zoom levels based on mode, since each zooms in a slightly different way
 */
export function getZoomLevels(mode: ViewerMode): [string | number, string][] {
  switch (mode) {
    case "document":
    case "annotating":
    case "redacting":
      return [
        ["width", "zoom.fitWidth"],
        ["height", "zoom.fitHeight"],
        [0.5, "50%"],
        [0.75, "75%"],
        [1, "100%"],
        [1.25, "125%"],
        [1.5, "150%"],
        [2, "200%"],
      ];

    case "text":
      return [
        [0.5, "50%"],
        [0.75, "75%"],
        [1, "100%"],
        [1.25, "125%"],
        [1.5, "150%"],
        [2, "200%"],
      ];

    case "grid":
      return [
        ["thumbnail", "zoom.thumbnail"],
        ["small", "zoom.small"],
        ["normal", "zoom.normal"],
        ["large", "zoom.large"],
      ];

    default:
      // notes don't zoom
      return [];
  }
}
