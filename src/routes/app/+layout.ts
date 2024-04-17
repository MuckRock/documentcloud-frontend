import { getPinnedAddons } from "@/lib/api/addons";
import * as projects from "$lib/api/projects";

export async function load({ url, fetch }) {
  const pinnedAddons = getPinnedAddons(fetch);
  const pinnedProjects = projects
    .list({ pinned: true }, fetch)
    .then((r) => r.results);

  return {
    pinnedAddons,
    pinnedProjects,
  };
}
