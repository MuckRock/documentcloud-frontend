// load data for a single page embed
import * as documents from "$lib/api/documents.js";
import * as notesApi from "$lib/api/notes.js";

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const [document, notes] = await Promise.all([
    documents.get(params.id, fetch),
    notesApi.list(params.id, fetch),
  ]);

  return {
    document,
    notes,
    page: params.page,
  };
}
