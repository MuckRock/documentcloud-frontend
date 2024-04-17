// load a note for embedding
import * as documents from "@/lib/api/documents";
import * as notesApi from "$lib/api/notes";

/** @type {import('./$types').PageLoad} */
export async function load({ params, url, fetch }) {
  const [document, note] = await Promise.all([
    documents.get(+params.id, fetch),
    notesApi.get(+params.id, params.note_id, fetch),
  ]);

  return {
    document,
    note,
  };
}
