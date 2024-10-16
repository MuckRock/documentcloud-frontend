// DUPLICATED FROM /documents/[id]-[slug]/
// TODO: CONSOLIDATE VIEWER LOADING LOGIC

/**
 * Load a document for the document viewer.
 * We do this in a layout module because sub-routes can use the same
 * document without loading it again.
 */

import { error, redirect } from "@sveltejs/kit";

import * as documents from "$lib/api/documents";
import type { ViewerMode, ReadMode } from "$lib/api/types";
import { getEmbedSettings, type EmbedSettings } from "$lib/utils/embed.js";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url, params, depends }) {
  const { data: document, error: err } = await documents.get(+params.id, fetch);

  if (err) {
    return error(err.status, err.message);
  }

  if (!document) {
    return error(404, "Document not found");
  }

  depends(`document:${document.id}`);

  let mode: ViewerMode =
    (url.searchParams.get("mode") as ViewerMode) ?? "document";

  if (!documents.MODES.has(mode)) {
    mode = documents.MODES[0];
  }

  // embeds are only readable
  // not sure if there's a better way to lie to typescript here
  if (!documents.READING_MODES.has(mode as ReadMode)) {
    return redirect(302, url.pathname);
  }

  let settings: Partial<EmbedSettings> = getEmbedSettings(url.searchParams);

  return {
    document,
    mode,
    settings,
  };
}
