import type { ReadMode } from "$lib/api/types";

import { redirect } from "@sveltejs/kit";

import { EMBED_MAX_AGE } from "@/config/config.js";
import { getEmbedSettings, type EmbedSettings } from "$lib/utils/embed.js";
import loadDocument from "$lib/load/document";
import * as documents from "$lib/api/documents";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url, params, depends, setHeaders }) {
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
  console.log(settings.fullscreen);

  setHeaders({
    "cache-control": `public, max-age=${EMBED_MAX_AGE}`,
    "last-modified": new Date(document.updated_at).toUTCString(),
  });

  return {
    document,
    mode,
    asset_url,
    settings,
  };
}
