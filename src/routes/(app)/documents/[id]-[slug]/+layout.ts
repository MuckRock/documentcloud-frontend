/**
 * Load a document for the document viewer.
 * We do this in a layout module because sub-routes can use the same
 * document without loading it again.
 */
import type { Document, ViewerMode, ReadMode } from "@/lib/api/types";

import { redirect, error } from "@sveltejs/kit";

import * as documents from "$lib/api/documents";
import { getPinnedAddons } from "$lib/api/addons";
import { breadcrumbTrail } from "$lib/utils/index";

import loadDocument from "$lib/load/document";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params, parent, depends, url }) {
  let { document, text, asset_url, mode } = await loadDocument({
    fetch,
    params,
    depends,
    url,
  });

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

  return {
    document,
    mode,
    text,
    asset_url,
    action,
    pinnedAddons,
    breadcrumbs,
  };
}
