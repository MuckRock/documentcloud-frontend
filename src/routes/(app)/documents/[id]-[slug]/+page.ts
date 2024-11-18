/**
 * Load a document for the document viewer.
 * We do this in a layout module because sub-routes can use the same
 * document without loading it again.
 */
import type { ReadMode } from "@/lib/api/types";

import { redirect } from "@sveltejs/kit";

import * as documents from "$lib/api/documents";
import { getPinnedAddons } from "$lib/api/addons";
import { breadcrumbTrail } from "$lib/utils/index";

import loadDocument from "$lib/load/document";
import { getQuery } from "$lib/utils/search";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params, parent, depends, url }) {
  const { document, asset_url, mode } = await loadDocument({
    fetch,
    params,
    url,
  });

  depends(`document:${document.id}`);

  const canonical = new URL(document.canonical_url);
  if (document.slug !== params.slug) {
    redirect(302, canonical.pathname);
  }

  if (!document.edit_access && !documents.READING_MODES.has(mode as ReadMode)) {
    return redirect(302, canonical);
  }

  let action = url.searchParams.get("action");

  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: canonical.pathname, title: document.title },
  ]);

  // stream this
  const pinnedAddons = getPinnedAddons(fetch);

  const query = getQuery(url);

  return {
    document,
    mode,
    asset_url,
    action,
    pinnedAddons,
    breadcrumbs,
    query,
  };
}
