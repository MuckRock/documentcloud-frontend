import type { ReadMode } from "$lib/api/types";

import { redirect } from "@sveltejs/kit";

import { getEmbedSettings, type EmbedSettings } from "$lib/utils/embed.js";
import { getQuery } from "$lib/utils/search.js";
import loadDocument from "$lib/load/document";
import * as documents from "$lib/api/documents";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url, params, depends }) {
  let { document, asset_url, mode } = await loadDocument({
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

  const query = getQuery(url, "q");

  return {
    document,
    mode,
    asset_url,
    settings,
    query,
  };
}
