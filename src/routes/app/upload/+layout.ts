/**
 * Data loading for upload
 */

import * as projectsApi from "$lib/api/projects.js";

export async function load({ fetch }) {
  const [pinned, projects] = await Promise.all([
    projectsApi.list({ pinned: true }, fetch),
    projectsApi.list({ per_page: 100 }, fetch),
  ]);

  return { pinnedProjects: pinned.results, projects };
}
