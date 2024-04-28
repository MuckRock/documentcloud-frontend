import * as documents from "$lib/api/documents";

export async function load({ fetch, parent, url }) {
  const mode = url.searchParams.get("mode") ?? "document";
  const { document } = await parent();

  return {
    mode,
    text: documents.text(document, fetch),
  };
}
