/**
 * Data loading for upload
 */

import * as projectsApi from "$lib/api/projects";

export async function load({ fetch, parent, data }) {
  const { me } = await parent();

  if (me) {
    const [pinned, projects] = await Promise.all([
      projectsApi.list({ pinned: true }, fetch),
      projectsApi.list({ per_page: 100, user: me.id }, fetch),
    ]);

    return { ...data, pinnedProjects: pinned.results, projects };
  }

  // anonymous gets empty results
  return {
    ...data,
    pinnedProjects: [],
    projects: { results: [] },
  };
}
