// load data for a single page embed
import * as documents from "@/lib/api/documents";
import * as notesApi from "$lib/api/notes.js";

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const { page } = params;
  let [document, notes] = await Promise.all([
    documents.get(params.id, fetch),
    notesApi.list(params.id, fetch),
  ]);

  notes = notes.results.filter((note) => note.page_number === page - 1);

  return {
    document,
    notes,
    page,
  };
}
