import { getAddons, scheduled, history } from "$lib/api/addons";

export async function load({ url, fetch }) {
  const params = Object.fromEntries(url.searchParams.entries());
  const addons = getAddons(params, fetch);
  const events = scheduled({ per_page: 5 }, fetch);
  const runs = history({ per_page: 5 }, fetch);

  return {
    addons,
    events,
    runs,
  };
}
