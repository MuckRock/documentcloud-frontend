/** Load notes and sections for viewing a single document */
import * as notes from "$lib/api/notes";

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  // stream these, because we can wait on them
  return {
    notes: notes.list(+params.id, fetch),
  };
}
