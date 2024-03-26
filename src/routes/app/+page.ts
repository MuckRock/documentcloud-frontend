import { search } from "$lib/api/documents.js";

export async function load({ url, fetch }) {
  const query = url.searchParams.get("q") || "";
  const per_page = +url.searchParams.get("per_page") || 25;
  const cursor = url.searchParams.get("cursor") || "";

  const options = {
    hl: true,
    per_page,
    cursor,
  };

  const searchResults = search(query, options, fetch);

  return {
    query,
    per_page,
    cursor,
    searchResults,
  };
}
