// load data for a single page embed
import { error } from "@sveltejs/kit";

import { EMBED_MAX_AGE } from "@/config/config.js";
import * as documents from "$lib/api/documents";
import * as notesApi from "$lib/api/notes";

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch, setHeaders }) {
  const page = +params.page;
  let [document, notes] = await Promise.all([
    documents.get(+params.id, fetch),
    notesApi.list(+params.id, fetch),
  ]);

  if (document.error || !document.data) {
    return error(404, "Document not found");
  }

  setHeaders({
    "cache-control": `public, max-age=${EMBED_MAX_AGE}`,
    "last-modified": new Date(document.data.updated_at).toUTCString(),
  });

  return {
    document: document.data,
    notes:
      notes.data?.results.filter((note) => note.page_number === page - 1) ?? [],
    page: +page,
  };
}
