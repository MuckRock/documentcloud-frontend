/**
 * Load a document for the document viewer.
 * We do this in a layout module because sub-routes can use the same
 * document without loading it again.
 */
import type { ReadMode } from "$lib/api/types";

import { redirect } from "@sveltejs/kit";

import { VIEWER_MAX_AGE } from "@/config/config.js";
import * as documents from "$lib/api/documents";
import { breadcrumbTrail } from "$lib/utils/index";
import loadDocument from "$lib/load/document";

export async function load({
  fetch,
  params,
  parent,
  depends,
  url,
  setHeaders,
  data,
}) {
  const { document, notes, asset_url, mode, cache } = await loadDocument({
    fetch,
    params,
    url,
  });

  depends(`document:${document.id}`);

  const canonical = documents.canonicalUrl(document);
  if (document.slug !== params.slug) {
    redirect(307, canonical.pathname);
  }

  if (!document.edit_access && !documents.READING_MODES.has(mode as ReadMode)) {
    return redirect(307, canonical);
  }

  const [breadcrumbs, { me }] = await Promise.all([
    breadcrumbTrail(parent, [
      { href: canonical.pathname, title: document.title },
    ]),
    parent(),
  ]);

  if (me) {
    // logged-in pages must never be stored by a shared cache or reused after logout
    setHeaders({ "cache-control": "private, no-store" });
  } else {
    // prefer the API's cache policy, falling back to our defaults
    setHeaders({
      "cache-control":
        cache?.cacheControl ?? `public, max-age=${VIEWER_MAX_AGE}`,
      "last-modified":
        cache?.lastModified ?? new Date(document.updated_at).toUTCString(),
      // matches the API's tag, which Cloudflare strips before we can read it
      "cache-tag": `doc-${document.id}`,
    });
  }

  return {
    ...data,
    document,
    notes,
    mode,
    asset_url,
    breadcrumbs,
  };
}
