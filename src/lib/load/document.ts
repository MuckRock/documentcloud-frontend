import type {
  APIResponse,
  Highlights,
  Maybe,
  ViewerMode,
} from "$lib/api/types";

import { error } from "@sveltejs/kit";
import * as documents from "$lib/api/documents";
import * as notesApi from "$lib/api/notes";

interface Load {
  fetch: typeof globalThis.fetch;
  params: { id: string };
  url: URL;
}

/**
 * Load a document and its assets
 */
export default async function load({ fetch, params, url }: Load) {
  // load doc and notes separately for caching
  const [doc, notes] = await Promise.all([
    documents.get(+params.id, fetch),
    notesApi.list(+params.id, { per_page: 100 }, fetch),
  ]);

  if (doc.error) {
    console.warn(doc.error.status, url.href);
    return error(doc.error.status, doc.error.message);
  }

  if (!doc.data) {
    return error(404, "Document not found");
  }

  let mode: ViewerMode =
    (url.searchParams.get("mode") as ViewerMode) ?? "document";
  const asset_url = await documents.assetUrl(doc.data, fetch);

  if (!documents.MODES.has(mode)) {
    mode = documents.MODES[0];
  }

  // If in search mode, get the query from the URL and
  // initialize a Promise for the first page of search results
  let search: Maybe<APIResponse<Highlights, null>> = undefined;
  const query = url.searchParams.get("q");
  if (query) {
    search = await documents.searchWithin(doc.data.id, query, undefined, fetch);
  }

  const document = doc.data;
  if (notes.data) {
    document.notes = notes.data.results;
  }

  return {
    document: doc.data,
    asset_url,
    mode,
    search,
  };
}
