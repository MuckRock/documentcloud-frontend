// load data for project embeds

import { error } from "@sveltejs/kit";
import { search } from "$lib/api/documents";
import { get } from "$lib/api/projects";

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const project = await get(+params.project_id, fetch);
  const documents = search(`+project:${params.project_id}`, undefined, fetch);
  if (project.error) {
    return error(project.error.status, project.error.message);
  }
  if (!project.data) {
    return error(404, "Project not found");
  }
  return {
    documents,
    error: project.error,
    project: project.data,
  };
}
