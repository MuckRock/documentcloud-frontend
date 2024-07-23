import { getAddons, scheduled, history } from "$lib/api/addons.js";
import { breadcrumbTrail } from "$lib/utils/navigation";

export async function load({ url, fetch }) {
  const params = Object.fromEntries(url.searchParams.entries());
  const addons = getAddons(params, fetch);
  const events = scheduled({}, fetch);
  const runs = history({}, fetch);

  return {
    addons,
    events,
    runs,
  };
}
