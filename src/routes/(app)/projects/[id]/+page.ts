// redirect to the full URL

import { error, redirect } from "@sveltejs/kit";
import * as projects from "$lib/api/projects";

export async function load({ params, fetch }) {
  const { data: project, error: err } = await projects.get(+params.id, fetch);

  if (err) {
    return error(err.status, err.message);
  }

  const url = projects.canonicalUrl(project);

  return redirect(302, url);
}
