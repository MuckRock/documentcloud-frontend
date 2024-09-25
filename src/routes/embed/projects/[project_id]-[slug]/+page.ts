// load data for project embeds

import { error, redirect } from "@sveltejs/kit";
import * as projects from "$lib/api/projects";

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  let id = params.project_id;
  let slug = params.slug;
  if (slug.match(/\d+/)) {
    // we're in the old-style URL pattern, so redirect
    id = params.slug;
  }
  const [project, documents] = await Promise.all([
    projects.get(+id, fetch),
    projects.documents(+params.project_id, fetch),
  ]);

  if (project.error) {
    return error(project.error.status, project.error.message);
  }

  if (project.data.slug !== params.slug) {
    return redirect(302, projects.embedUrl(project.data));
  }

  return {
    documents,
    error: project.error,
    project: project.data,
  };
}
