import type {
  Document,
  Maybe,
  Note,
  Nullable,
  Section,
  Sizes,
  ViewerMode,
  Zoom,
  ZoomLevels,
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

/**
 * Multiplier to convert PDF points (1/72 inch) to CSS pixels (1/96 inch)
 */
export const PT_TO_PX = 96 / 72;

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
    let url = embed ? embedUrl(document) : canonicalUrl(document);
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
    const [width, height] =
      size?.split("x").map((d) => parseFloat(d) * PT_TO_PX) ?? [];

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

/**
 * A document's sections ordered by page. The API returns them in insertion
 * order (via `expand`), so sort before listing them for navigation.
 */
export function sortedSections(document: Document): Section[] {
  return [...(document.sections ?? [])].sort(
    (a, b) => a.page_number - b.page_number,
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
      return "auto";

    case "annotating":
      return "auto";

    case "redacting":
      return "auto";

    case "grid":
      return "small";

    default:
      return 1;
  }
}

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const ZOOM_LEVELS: [number, string][] = ZOOM_STEPS.map((value) => [
  value,
  `${value * 100}%`,
]);

/**
 * Generate zoom levels based on mode, since each zooms in a slightly different way
 */
export function getZoomLevels(mode: ViewerMode, zoom?: Zoom): ZoomLevels {
  switch (mode) {
    case "document":
    case "annotating":
    case "redacting":
      const levels = [...ZOOM_LEVELS];
      if (typeof zoom === "number" && !ZOOM_STEPS.includes(zoom)) {
        levels.push([zoom, `${Math.round(zoom * 100)}%`]);
        levels.sort(([a], [b]) => a - b);
      }
      return [["auto", "zoom.auto"], ...levels];

    case "text":
      return ZOOM_LEVELS;

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

export function getInitialZoom(url: Maybe<URL>, mode: ViewerMode): Maybe<Zoom> {
  const zoom = url?.searchParams?.get("zoom");

  if (!zoom) return undefined;

  const numeric = new Set(["document", "text", "annotating", "redacting"]);

  if (numeric.has(mode) && zoom.match(/\d+/)) {
    return +zoom;
  }

  // Check if the zoom value matches any of the valid levels
  const match = getZoomLevels(mode).find(([value, _label]) => {
    return String(value) === zoom;
  });

  if (match) {
    return match[0] as Zoom;
  }

  // fallback
  return undefined;
}

export function getZoomInOut(
  mode: ViewerMode,
  zoom: Zoom,
  scale: number,
): [Nullable<Zoom>, Nullable<Zoom>] {
  const zoomValues = getZoomLevels(mode).map(([value]) => value);

  let zoomOut: Maybe<Zoom>, zoomIn: Maybe<Zoom>;

  // If the viewer is in grid mode, look up the string index
  if (mode === "grid") {
    const index = zoomValues.indexOf(zoom as Sizes);
    zoomOut = zoomValues[index - 1];
    zoomIn = zoomValues[index + 1];
  } else {
    // Other modes use numeric zoom levels.
    // If zoom is 'auto', use the calculated auto zoom scale.
    // Otherwise, use the numeric value of zoom.
    zoomOut = (zoomValues as number[]).findLast((val) => val < scale);
    zoomIn = (zoomValues as number[]).find((val) => val > scale);
  }

  return [zoomOut ?? null, zoomIn ?? null];
}
