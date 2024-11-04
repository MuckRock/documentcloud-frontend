// load data for project embeds
import type { Maybe } from "$lib/api/types";

import { error, redirect } from "@sveltejs/kit";
import { search } from "$lib/api/documents";
import { get, embedUrl } from "$lib/api/projects";

const OLD_PATTERN = /(\D+)-(\d+)/;

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch, url }) {
  // handle old URLs
  let { project_id, slug }: Record<string, Maybe<string>> = params;
  if (`${project_id}-${slug}`.match(OLD_PATTERN)) {
    const groups = OLD_PATTERN.exec(`${project_id}-${slug}`);
    project_id = groups?.[2];
  }

  if (!project_id) {
    return error(404, "Project not found");
  }

  const project = await get(+project_id, fetch);
  const documents = search(`+project:${project_id}`, undefined, fetch);

  if (project.error) {
    return error(project.error.status, project.error.message);
  }

  if (!project.data) {
    return error(404, "Project not found");
  }

  if (url.pathname !== embedUrl(project.data).pathname) {
    return redirect(302, embedUrl(project.data));
  }

  return {
    documents,
    error: project.error,
    project: project.data,
  };
}
