// load a note for embedding
import * as documents from "@/lib/api/documents";
import * as notesApi from "$lib/api/notes";

export async function load({ params, fetch }) {
  const [document, note] = await Promise.all([
    documents.get(+params.id, fetch),
    notesApi.get(+params.id, parseInt(params.note_id), fetch),
  ]);

  return {
    document: document.data,
    note: note.data,
  };
}
