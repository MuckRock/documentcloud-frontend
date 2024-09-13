// DUPLICATED FROM /documents/[id]-[slug]/
// TODO: CONSOLIDATE VIEWER LOADING LOGIC

/**
 * Load a document for the document viewer.
 * We do this in a layout module because sub-routes can use the same
 * document without loading it again.
 */

import { error } from "@sveltejs/kit";

import * as documents from "$lib/api/documents";
import type { ViewerMode } from "$lib/api/types";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url, params, depends }) {
  const document = await documents.get(+params.id, fetch).catch(console.error);

  if (!document) {
    error(404, "Document not found");
  }

  depends(`document:${document.id}`);

  let mode: ViewerMode =
    (url.searchParams.get("mode") as ViewerMode) ?? "document";

  if (!documents.MODES.has(mode)) {
    mode = documents.MODES[0];
  }

  return {
    document,
    mode,
  };
}
