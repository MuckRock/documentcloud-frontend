// load a note for embedding
import { error } from "@sveltejs/kit";

import { EMBED_MAX_AGE } from "@/config/config.js";
import * as documents from "$lib/api/documents";
import * as notesApi from "$lib/api/notes";

export async function load({ params, fetch, setHeaders }) {
  const [document, note] = await Promise.all([
    documents.get(+params.id, fetch),
    notesApi.get(+params.id, parseInt(params.note_id), fetch),
  ]);

  if (document.error || !document.data || note.error || !note.data) {
    return error(404, "Document not found");
  }

  setHeaders({
    "cache-control": `public, max-age=${EMBED_MAX_AGE}`,
    "last-modified": new Date(document.data.updated_at).toUTCString(),
  });

  return {
    document: document.data,
    note: note.data,
  };
}
