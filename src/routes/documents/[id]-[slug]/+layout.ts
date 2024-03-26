/**
 * Load a document for the document viewer.
 * We do this in a layout module because sub-routes can use the same
 * document without loading it again.
 */

import { redirect } from "@sveltejs/kit";
import * as documents from "@/lib/api/documents";
import { getPinnedAddons } from "$lib/api/addons.js";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
  const document = await documents.get(+params.id, fetch);

  if (document.slug !== params.slug) {
    const canonical = new URL(document.canonical_url);
    redirect(302, canonical.pathname);
  }

  // stream this
  const pinnedAddons = getPinnedAddons(fetch);

  return { document, pinnedAddons };
}
