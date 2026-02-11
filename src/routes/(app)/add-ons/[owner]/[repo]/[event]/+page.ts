import { error } from "@sveltejs/kit";

import * as addons from "$lib/api/addons";
import { search } from "$lib/api/documents";
import { breadcrumbTrail } from "$lib/utils/navigation";
import { userDocs } from "$lib/utils/search";

export async function load({ params, fetch, parent, url }) {
  const { data: event, error: err } = await addons.getEvent(
    +params.event,
    fetch,
  );

  if (err) {
    return error(err.status, err.message);
  }
  if (!event) {
    return error(404, "Event not found");
  }
  if (!addons.isAddon(event.addon)) {
    return error(404, "Add-On not found");
  }

  const addon = event.addon;

  // there's probably something better to use as a breadcrumb title
  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: `/add-ons/${addon.repository}/`, title: addon.name },
    { href: url.pathname, title: event.id.toString() },
  ]);

  const { me } = await parent();
  const query = url.searchParams.get("q") || userDocs(me);

  const searchResults = search(query, {}, fetch).then((r) => r.data);

  return {
    breadcrumbs,
    event,
    query,
    searchResults,
    scheduled: addons
      .scheduled({ addon: addon.id, per_page: 100 }, fetch)
      .then((r) => r.data),
    history: addons
      .history({ addon: addon.id }, fetch)
      .then((r) => r.data),
  };
}
