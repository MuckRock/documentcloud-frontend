/**
 * Load a document for the document viewer.
 * We do this in a layout module because sub-routes can use the same
 * document without loading it again.
 */
import type { Document } from "@/lib/api/types";

import { redirect, error } from "@sveltejs/kit";

import { DC_BASE } from "@/config/config.js";
import * as documents from "$lib/api/documents";
import { getPinnedAddons } from "$lib/api/addons";
import { breadcrumbTrail, getPrivateAsset } from "$lib/utils/index";

function documentPath(document: Document) {
  return `/documents/${document.id}-${document.slug}`;
}

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params, parent }) {
  const document = await documents.get(+params.id, fetch).catch(console.error);

  if (!document) {
    error(404, "Document not found");
  }

  if (document.slug !== params.slug) {
    const canonical = new URL(document.canonical_url);
    redirect(302, canonical.pathname);
  }

  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: "/app", title: "Documents" }, // TODO: move document manager to `/documents` route
    { href: documentPath(document), title: document.title },
  ]);

  let asset_url = documents.pdfUrl(document);

  // assets still processing are in private storage until finished
  if (document.access !== "public" || String(asset_url).startsWith(DC_BASE)) {
    asset_url = await getPrivateAsset(asset_url, fetch).catch((e) => {
      console.error(e);
      console.error(asset_url.href);
      return asset_url;
    });
  }

  // stream this
  const pinnedAddons = getPinnedAddons(fetch);

  return {
    document,
    asset_url,
    pinnedAddons,
    breadcrumbs,
  };
}
