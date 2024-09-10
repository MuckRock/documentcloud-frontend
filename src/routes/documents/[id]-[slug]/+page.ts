import type { DocumentText, ViewerMode } from "$lib/api/types.js";

import * as documents from "$lib/api/documents";

export async function load({ fetch, parent, url, data, depends }) {
  let mode: ViewerMode =
    (url.searchParams.get("mode") as ViewerMode) ?? "document";

  if (!documents.MODES.has(mode)) {
    mode = documents.MODES[0];
  }

  const query = url.searchParams.get("q") ?? "";

  const { document } = await parent();

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
