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

import loadDocument from "$lib/load/document";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url, params, depends }) {
  let { document, text, asset_url, mode } = await loadDocument({
    fetch,
    url,
    params,
    depends,
  });

  // embeds are only readable
  // not sure if there's a better way to lie to typescript here
  if (!documents.READING_MODES.has(mode as ReadMode)) {
    return redirect(302, url.pathname);
  }

  let settings: Partial<EmbedSettings> = getEmbedSettings(url.searchParams);

  return {
    document,
    mode,
    text,
    asset_url,
    settings,
  };
}
