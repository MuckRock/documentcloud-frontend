import type { DocumentText, ViewerMode } from "$lib/api/types.js";
import * as documents from "$lib/api/documents";

export async function load({ fetch, parent, url }) {
  let mode: ViewerMode =
    (url.searchParams.get("mode") as ViewerMode) ?? "document";

  if (!documents.MODES.has(mode)) {
    mode = "document";
  }

  // only load text in text mode
  let text: Promise<DocumentText> = Promise.resolve({
    updated: 0,
    pages: [],
  });

  if (mode === "text") {
    const { document } = await parent();
    text = documents.text(document, fetch);
  }

  return {
    mode,
    text,
  };
}
