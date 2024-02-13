import { search } from "$lib/api/documents.js";

export async function load({ url, fetch }) {
  const query = url.searchParams.get("q") || "";

  const searchResults = search(query, true, fetch);

  return {
    searchResults,
  };
}
