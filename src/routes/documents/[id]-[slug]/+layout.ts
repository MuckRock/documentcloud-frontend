/**
 * Load a document for the document viewer.
 * We do this in a layout module because sub-routes can use the same
 * document without loading it again.
 */

import { redirect } from "@sveltejs/kit";
import * as documents from "@/lib/api/documents";
import type { Document } from "@/lib/api/types";
import { getPinnedAddons } from "$lib/api/addons";
import { breadcrumbTrail } from "$lib/utils/navigation";

function documentPath(document: Document) {
  return `/documents/${document.id}-${document.slug}`;
}

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params, parent }) {
  const document = await documents.get(+params.id, fetch);

  if (document.slug !== params.slug) {
    const canonical = new URL(document.canonical_url);
    redirect(302, canonical.pathname);
  }

  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: "/app", title: "Documents" }, // TODO: move document manager to `/documents` route
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
