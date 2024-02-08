/** Load notes and sections for viewing a single document */
import * as documents from "$lib/api/documents.js";

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  // stream these, because we can wait on them
  const notes = documents.notes(params.id, fetch);
  const sections = documents.sections(params.id, fetch);

  return {
    notes,
    sections,
  };
}
