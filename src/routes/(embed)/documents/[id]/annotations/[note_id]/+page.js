// load a note for embedding
import * as documents from "$lib/api/documents.js";
import * as notesApi from "$lib/api/notes.js";

/** @type {import('./$types').PageLoad} */
export async function load({ params, url, fetch }) {
  const [document, note] = await Promise.all([
    documents.get(params.id, fetch),
    notesApi.get(params.id, params.note_id),
  ]);

  return {
    document,
    note,
  };
}
