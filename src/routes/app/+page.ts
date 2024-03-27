import type { SearchOptions } from "$lib/api/types";
import { search } from "$lib/api/documents.js";

export async function load({ url, fetch }) {
  const query = url.searchParams.get("q") || "";
  const per_page = +url.searchParams.get("per_page") || 25;
  const cursor = url.searchParams.get("cursor") || "";
  const page = +url.searchParams.get("page") || null;

  const options: SearchOptions = {
    hl: true,
  };

  if (per_page) {
    options.per_page = per_page;
  }

  if (cursor) {
    options.cursor = cursor;
  }

  if (page) {
    options.page = page;
  }

  const searchResults = search(query, options, fetch);

  return {
    query,
    per_page,
    page,
    cursor,
    searchResults,
  };
}
