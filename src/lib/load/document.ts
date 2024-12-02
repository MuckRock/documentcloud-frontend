import type {
  APIResponse,
  Highlights,
  Maybe,
  ViewerMode,
} from "$lib/api/types";

import { error } from "@sveltejs/kit";
import * as documents from "$lib/api/documents";

interface Load {
  fetch: typeof globalThis.fetch;
  params: { id: string };
  url: URL;
}

/**
 * Load a document and its assets
 */
export default async function load({ fetch, params, url }: Load) {
  const { data: document, error: err } = await documents.get(+params.id, fetch);

  if (err) {
    return error(err.status, err.message);
  }

  if (!document) {
    return error(404, "Document not found");
  }

  let mode: ViewerMode =
    (url.searchParams.get("mode") as ViewerMode) ?? "document";
  const asset_url = await documents.assetUrl(document, fetch);

  if (!documents.MODES.has(mode)) {
    mode = documents.MODES[0];
  }

  // If in search mode, get the query from the URL and
  // initialize a Promise for the first page of search results
  let search: Maybe<APIResponse<Highlights, null>> = undefined;
  if (mode === "search") {
    const query = url.searchParams.get("query");
    if (query) {
      search = await documents.searchWithin(
        document.id,
        query,
        undefined,
        fetch,
      );
    }
  }

  return {
    document,
    asset_url,
    mode,
    search,
  };
}
