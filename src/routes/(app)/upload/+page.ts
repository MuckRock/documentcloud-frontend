/**
 * Data loading for upload
 */
import { redirect } from "@sveltejs/kit";
import * as projectsApi from "$lib/api/projects";

export async function load({ fetch, parent }) {
  const { me } = await parent();

  if (!me) {
    return redirect(302, "/home/");
  }

  const projects = await projectsApi.list(
    { per_page: 100, user: me.id },
    fetch,
  );

  return {
    projects: projects.data,
  };
}
