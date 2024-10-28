// load a note for embedding
import * as documents from "@/lib/api/documents";
import * as notesApi from "$lib/api/notes";
import { error } from "@sveltejs/kit";

export async function load({ params, fetch }) {
  const [document, note] = await Promise.all([
    documents.get(+params.id, fetch),
    notesApi.get(+params.id, parseInt(params.note_id), fetch),
  ]);

  if (document.error || !document.data || note.error || !note.data) {
    return error(404, "Document not found");
  }

  return {
    document: document.data,
    note: note.data,
  };
}
