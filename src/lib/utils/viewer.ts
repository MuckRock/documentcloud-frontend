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
