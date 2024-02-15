/** Load notes and sections for viewing a single document */
import * as notes from "$lib/api/notes.js";
import * as sections from "$lib/api/sections.js";

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  // stream these, because we can wait on them
  return {
    notes: notes.list(params.id, fetch),
    sections: sections.list(params.id, fetch),
  };
}
