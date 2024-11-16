import type { ViewerMode } from "$lib/api/types";

import { error } from "@sveltejs/kit";
import * as documents from "$lib/api/documents";

interface Load {
  fetch: typeof globalThis.fetch;
  params: { id: string };
  url: URL;
}

/**
 * Load a document and its assets
 */
export default async function load({ fetch, params, url }: Load) {
  const { data: document, error: err } = await documents.get(+params.id, fetch);

  if (err) {
    return error(err.status, err.message);
  }

  if (!document) {
    return error(404, "Document not found");
  }

  let mode: ViewerMode =
    (url.searchParams.get("mode") as ViewerMode) ?? "document";
  const text = { updated: 0, pages: [] }; // await documents.text(document, fetch);
  const asset_url = await documents.assetUrl(document, fetch);

  if (!documents.MODES.has(mode)) {
    mode = documents.MODES[0];
  }

  return {
    document,
    text,
    asset_url,
    mode,
  };
}
