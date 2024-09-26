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

function documentPath(document: Document) {
  return `/documents/${document.id}-${document.slug}/`;
}

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params, parent, depends, url }) {
  const { data: document, error: err } = await documents.get(+params.id, fetch);

  if (err) {
    error(err.status, err.message);
  }

  if (!document) {
    error(404, "Document not found");
  }

  const canonical = new URL(document.canonical_url);
  if (document.slug !== params.slug) {
    redirect(302, canonical.pathname);
  }

  let mode: ViewerMode =
    (url.searchParams.get("mode") as ViewerMode) ?? "document";

  if (!documents.MODES.has(mode)) {
    mode = documents.MODES[0];
  }

  if (!document.edit_access && !documents.READING_MODES.has(mode as ReadMode)) {
    return redirect(302, canonical);
  }

  let action = url.searchParams.get("action");

  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: "/documents/", title: "Documents" },
    { href: documentPath(document), title: document.title },
  ]);

  // stream this
  const pinnedAddons = getPinnedAddons(fetch);

  depends(`document:${document.id}`);

  return {
    document,
    mode,
    action,
    pinnedAddons,
    breadcrumbs,
  };
}
