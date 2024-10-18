import type { DocumentText } from "$lib/api/types.js";

import * as documents from "$lib/api/documents";

export async function load({ fetch, parent, url, data, depends }) {
  const query = url.searchParams.get("q") ?? "";

  const { document, mode } = await parent();

  // load text
  let text = await documents.text(document, fetch);

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
