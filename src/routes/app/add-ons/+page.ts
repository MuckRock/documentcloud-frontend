import { getAddons } from "$lib/api/addons.js";
import { breadcrumbTrail } from "$lib/utils/navigation";

export async function load({ url, fetch, parent }) {
  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: "/app/add-ons", title: "Add-Ons" },
  ]);
  const params = Object.fromEntries(url.searchParams.entries());
  const addons = getAddons(params, fetch);
  return {
    breadcrumbs,
    addons,
  };
}
