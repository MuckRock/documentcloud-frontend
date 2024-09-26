import { getContext } from "svelte";
import type { Writable } from "svelte/store";
import type { Document, Note, ViewerMode } from "$lib/api/types";
import { canonicalUrl, pageHashUrl } from "../api/documents";
import { noteHashUrl } from "../api/notes";

interface ViewerHrefOptions {
  document?: Document;
  page?: number;
  note?: Note;
  mode?: ViewerMode;
  embed?: boolean;
}

export function isEmbedded(): boolean {
  // are we embedded?
  return getContext("embed") ?? false;
}

export function getCurrentPage(): Writable<number> {
  return getContext("currentPage");
}

export function getCurrentMode(): Writable<ViewerMode> {
  return getContext("currentMode");
}

export function getActiveNote(): Writable<Note> {
  return getContext("activeNote");
}

export function getViewerHref(options: ViewerHrefOptions = {}) {
  const { document, page, note, mode = "document", embed = false } = options;
  let hash = "";
  if (page) hash = pageHashUrl(page);
  if (note) hash = noteHashUrl(note);
  if (document) {
    // If we have the document, we can provide an absolute URL
    let url = canonicalUrl(document);
    url.searchParams.set("mode", mode);
    if (embed) url.searchParams.set("embed", "1");
    if (hash) url.hash = hash;
    return url.href;
  } else {
    // If we don't, we can provide a relative URL
    let href = `?mode=${mode}`;
    if (embed) href += "&embed=1";
    if (hash) href += hash;
    return href;
  }
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

  return parts.reduce((sizes, part, i) => {
    const [size, range] = part.split(":");
    const [width, height] = size.split("x").map(parseFloat);

    range.split(",").forEach((rangePart) => {
      if (rangePart.includes("-")) {
        const [start, end] = rangePart.split("-").map((x) => parseInt(x, 10));
        for (let page = start; page <= end; page++) {
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
