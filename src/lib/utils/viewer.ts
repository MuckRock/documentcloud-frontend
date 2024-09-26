import { getContext } from "svelte";
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

export function getViewerHref(options: ViewerHrefOptions = {}) {
  const { document, page, note, mode = "document", embed = false } = options;
  if (document) {
    // If we have the document, we can provide an absolute URL
    let url = canonicalUrl(document);
    if (page) url.hash = pageHashUrl(page);
    if (note) url.hash = noteHashUrl(note);
    url.searchParams.set("mode", mode);
    if (embed) url.searchParams.set("embed", "1");
    return url.href;
  } else {
    // If we don't, we can provide a relative URL
    let href = `?mode=${mode}`;
    let hash: string;
    if (embed) href += "&embed=1";
    if (page) hash = pageHashUrl(page);
    if (note) hash = noteHashUrl(note);
    if (hash) href += hash;
    return href;
  }
}
