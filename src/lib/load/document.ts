import type {
  APIResponse,
  CacheInfo,
  Document,
  Note,
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

interface LoadResult {
  document: Document;
  notes: Note[] | never[];
  cache: Maybe<CacheInfo>;
  asset_url: URL;
  mode: ViewerMode;
  search: Maybe<APIResponse<Highlights, null>>;
}

/**
 * Load a document and its assets
 */
export default async function load({
  fetch,
  params,
  url,
}: Load): Promise<LoadResult> {
  // load doc and notes separately for caching
  const [doc, notes] = await Promise.all([
    documents.get(params.id, fetch),
    notesApi.all(params.id, fetch),
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

  return {
    document: doc.data,
    cache: doc.cache,
    notes,
    asset_url,
    mode,
    search,
  };
}
