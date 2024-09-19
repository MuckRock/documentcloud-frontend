import type { DocumentText } from "$lib/api/types.js";

import * as documents from "$lib/api/documents";

export async function load({ fetch, parent, url, data, depends }) {
  const query = url.searchParams.get("q") ?? "";

  const { document, mode } = await parent();

  // only load text in text mode
  let text: Promise<DocumentText> = Promise.resolve({
    updated: 0,
    pages: [],
  });

  if (mode === "text") {
    text = documents.text(document, fetch);
  }

  const asset_url = await documents.assetUrl(document, fetch);

  // so we can reload when we reprocess
  depends(`document:${document.id}`);

  return {
    ...(data ?? {}), // include csrf_token
    asset_url,
    query,
    text,
    mode,
  };
}
