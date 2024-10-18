import { error, redirect } from "@sveltejs/kit";
import * as documents from "$lib/api/documents";
import type { ViewerMode, ReadMode } from "$lib/api/types";
import loadDocument from "$lib/load/document";
import { getEmbedSettings, type EmbedSettings } from "$lib/utils/embed.js";
import { getQuery } from "$lib/utils/search.js";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url, params, depends }) {
  let { document, text, asset_url, mode } = await loadDocument({
    fetch,
    url,
    params,
  });

  depends(`document:${document.id}`);

  // embeds are only readable
  // not sure if there's a better way to lie to typescript here
  if (!documents.READING_MODES.has(mode as ReadMode)) {
    return redirect(302, url.pathname);
  }

  let settings: Partial<EmbedSettings> = getEmbedSettings(url.searchParams);

  const query = getQuery(url);

  return {
    document,
    mode,
    text,
    asset_url,
    settings,
    query,
  };
}
