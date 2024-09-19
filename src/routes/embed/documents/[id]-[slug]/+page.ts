import type { DocumentText, ViewerMode } from "@/lib/api/types";
// load data for a single page embed
import * as documents from "@/lib/api/documents";
import * as notesApi from "$lib/api/notes";

/** @type {import('./$types').PageLoad} */
export async function load({ parent, fetch, url }) {
  const { document, mode } = await parent();

  const query = url.searchParams.get("q") ?? "";

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
    asset_url,
    query,
    text,
  };
}
