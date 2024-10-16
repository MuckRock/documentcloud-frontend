// load data for a single page embed
import * as documents from "@/lib/api/documents";
import * as notesApi from "$lib/api/notes";

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const page = +params.page;
  let [document, notes] = await Promise.all([
    documents.get(+params.id, fetch),
    notesApi.list(+params.id, fetch),
  ]);

  return {
    document: document.data,
    notes: notes.results.filter((note) => note.page_number === page - 1),
    page: +page,
  };
}
