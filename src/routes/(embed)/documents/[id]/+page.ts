import type { DocumentText, ViewerMode } from "@/lib/api/types";
// load data for a single page embed
import * as documents from "@/lib/api/documents";
import * as notesApi from "$lib/api/notes";

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch, url }) {
  let mode: ViewerMode =
    (url.searchParams.get("mode") as ViewerMode) ?? "document";

  if (!documents.MODES.has(mode)) {
    mode = documents.MODES[0];
  }

  let [document] = await Promise.all([
    documents.get(+params.id, fetch),
  ]);

  const asset_url = await documents.assetUrl(document, fetch);

  // only load text in text mode
  let text: Promise<DocumentText> = Promise.resolve({
    updated: 0,
    pages: [],
  });

  if (mode === "text") {
    text = documents.text(document, fetch);
  }

  return {
    document,
    text,
    mode,
    asset_url
  };
}
