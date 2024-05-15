import type { DocumentText, ViewerMode } from "$lib/api/types.js";

import { DC_BASE } from "@/config/config.js";
import * as documents from "$lib/api/documents";
import { getPrivateAsset } from "$lib/utils/api";

export async function load({ fetch, parent, url }) {
  let mode: ViewerMode =
    (url.searchParams.get("mode") as ViewerMode) ?? "document";

  if (!documents.MODES.has(mode)) {
    mode = documents.MODES[0];
  }

  const { document } = await parent();

  // only load text in text mode
  let text: Promise<DocumentText> = Promise.resolve({
    updated: 0,
    pages: [],
  });

  if (mode === "text") {
    text = documents.text(document, fetch);
  }

  let asset_url = documents.pdfUrl(document);

  // assets still processing are in private storage until finished
  if (document.access !== "public" || String(asset_url).startsWith(DC_BASE)) {
    asset_url = await getPrivateAsset(asset_url, fetch).catch((e) => {
      console.error(e);
      console.error(asset_url.href);
      return asset_url;
    });
  }

  return {
    asset_url,
    mode,
    text,
  };
}
