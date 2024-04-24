import { breadcrumbTrail } from "$lib/utils/navigation";
import { getAddon } from "@/lib/api/addons.js";
import { error } from "@sveltejs/kit";

export async function load({ url, params, fetch, parent }) {
  const { owner, repo } = params;
  const addon = await getAddon(owner, repo, fetch);
  if (!addon) {
    return error(404, "Add-On Not Found");
  }
  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: url.pathname, title: addon.name },
  ]);
  return {
    addon,
    breadcrumbs,
  };
}
