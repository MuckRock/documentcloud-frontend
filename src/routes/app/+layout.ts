import * as projects from "$lib/api/projects";
import { getPinnedAddons } from "$lib/api/addons";
import { breadcrumbTrail } from "$lib/utils/navigation";

export async function load({ fetch, parent }) {
  const pinnedAddons = getPinnedAddons(fetch);
  const pinnedProjects = projects
    .list({ pinned: true }, fetch)
    .then((r) => r.results)
    .catch(console.error);

  const breadcrumbs = await breadcrumbTrail(parent, [
    // { href: "/app", title: "Documents" }, // TODO: move document manager to `/documents` route
  ]);

  return {
    pinnedAddons,
    pinnedProjects,
    breadcrumbs,
  };
}
