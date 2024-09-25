// load data for project embeds

import * as projects from "$lib/api/projects";

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const [project, documents] = await Promise.all([
    projects.get(+params.project_id, fetch),
    projects.documents(+params.project_id, fetch),
  ]);

  return {
    documents,
    error: project.error,
    project: project.data,
  };
}
