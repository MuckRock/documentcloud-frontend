import type { DocumentText, ViewerMode } from "@/lib/api/types";
// load data for a single page embed
import * as documents from "@/lib/api/documents";
import * as notesApi from "$lib/api/notes";

/** @type {import('./$types').PageLoad} */
export async function load({ parent, fetch, url }) {
  const { document } = await parent();

  const query = url.searchParams.get("q") ?? "";

  // load text
  const text = await documents.text(document, fetch);
  const asset_url = await documents.assetUrl(document, fetch);

  return {
    asset_url,
    query,
    text,
  };
}
