/**
 * Load a document for the document viewer.
 * We do this in a layout module because sub-routes can use the same
 * document without loading it again.
 */
import type { ReadMode } from "@/lib/api/types";

import { redirect } from "@sveltejs/kit";

import { VIEWER_MAX_AGE } from "@/config/config.js";
import * as documents from "$lib/api/documents";
import { breadcrumbTrail } from "$lib/utils/index";
import loadDocument from "$lib/load/document";

/** @type {import('./$types').PageLoad} */
export async function load({
  fetch,
  params,
  parent,
  depends,
  url,
  setHeaders,
  data,
}) {
  const { document, asset_url, mode } = await loadDocument({
    fetch,
    params,
    url,
  });

  depends(`document:${document.id}`);

  const canonical = documents.canonicalUrl(document);
  if (document.slug !== params.slug) {
    redirect(302, canonical.pathname);
  }

  if (!document.edit_access && !documents.READING_MODES.has(mode as ReadMode)) {
    return redirect(302, canonical);
  }

  let action = url.searchParams.get("action");

  const [breadcrumbs, { me }] = await Promise.all([
    breadcrumbTrail(parent, [
      { href: canonical.pathname, title: document.title },
    ]),
    parent(),
  ]);

  if (!me) {
    setHeaders({
      "cache-control": `public, max-age=${VIEWER_MAX_AGE}`,
      "last-modified": new Date(document.updated_at).toUTCString(),
    });
  }

  return {
    ...data,
    document,
    mode,
    asset_url,
    action,
    breadcrumbs,
  };
}
