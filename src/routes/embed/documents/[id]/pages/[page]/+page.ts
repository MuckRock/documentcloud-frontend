// load data for a single page embed
import * as documents from "@/lib/api/documents";
import * as notesApi from "$lib/api/notes";
import { error } from "@sveltejs/kit";

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const page = +params.page;
  let [document, notes] = await Promise.all([
    documents.get(+params.id, fetch),
    notesApi.list(+params.id, fetch),
  ]);

  if (document.error || !document.data) {
    return error(404, "Document not found");
  }

  return {
    document: document.data,
    notes:
      notes.data?.results.filter((note) => note.page_number === page - 1) ?? [],
    page: +page,
  };
}
