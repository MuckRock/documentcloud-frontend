/**
 * Data loading for upload
 */

import * as projectsApi from "$lib/api/projects";

export async function load({ fetch, parent }) {
  const { me } = await parent();

  if (me) {
    const projects = await projectsApi.list(
      { per_page: 100, user: me.id },
      fetch,
    );

    return {
      projects: projects.data,
    };
  }

  // anonymous gets empty results
  return {
    projects: { results: [] },
  };
}
