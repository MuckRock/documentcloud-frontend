import { error } from "@sveltejs/kit";
import * as documents from "$lib/api/documents";
import type { ViewerMode } from "$lib/api/types";

interface Load {
  fetch: typeof globalThis.fetch;
  params: { id: string };
  url: URL;
}

export default async function load({ fetch, params, url }: Load) {
  const { data: document, error: err } = await documents.get(+params.id, fetch);

  if (err) {
    throw error(err.status, err.message);
  }

  if (!document) {
    throw error(404, "Document not found");
  }

  let mode: ViewerMode =
    (url.searchParams.get("mode") as ViewerMode) ?? "document";
  const text = await documents.text(document, fetch);
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
