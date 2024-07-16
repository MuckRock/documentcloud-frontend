/**
 * Load a document for the document viewer.
 * We do this in a layout module because sub-routes can use the same
 * document without loading it again.
 */
import type { Document } from "@/lib/api/types";

import { redirect, error } from "@sveltejs/kit";

import * as documents from "$lib/api/documents";
import { getPinnedAddons } from "$lib/api/addons";
import { breadcrumbTrail } from "$lib/utils/index";

function documentPath(document: Document) {
  return `/documents/${document.id}-${document.slug}/`;
}

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params, parent, depends, url }) {
  const document = await documents.get(+params.id, fetch).catch(console.error);

  if (!document) {
    error(404, "Document not found");
  }

  if (document.slug !== params.slug) {
    const canonical = new URL(document.canonical_url);
    redirect(302, canonical.pathname);
  }

  depends(`document:${document.id}`);

  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: "/documents/", title: "Documents" },
    { href: documentPath(document), title: document.title },
  ]);

  // stream this
  const pinnedAddons = getPinnedAddons(fetch);

  return {
    document,
    pinnedAddons,
    breadcrumbs,
  };
}
