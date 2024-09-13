import type { DocumentResults } from "$lib/api/types";

import { error } from "@sveltejs/kit";

import * as addons from "$lib/api/addons";
import { search } from "$lib/api/documents";
import { breadcrumbTrail } from "$lib/utils/navigation";
import { userDocs } from "$lib/utils/search";

export async function load({ params, fetch, parent, url }) {
  const event = await addons
    .getEvent(+params.event, fetch)
    .catch(console.error);

  if (!event) {
    return error(404, "Event not found");
  }

  // there's probably something better to use as a breadcrumb title
  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: `/add-ons/${event.addon.repository}/`, title: event.addon.name },
    { href: url.pathname, title: event.id.toString() },
  ]);

  const { me } = await parent();
  const query = url.searchParams.get("q") || userDocs(me);

  const searchResults = search(query, {}, fetch).catch((e) => {
    console.error(e);
    return {
      results: [],
      count: 0,
      next: null,
    } as DocumentResults;
  });

  return {
    breadcrumbs,
    event,
    query,
    searchResults,
    scheduled: addons.scheduled(
      { addon: event.addon.id, per_page: 100 },
      fetch,
    ),
  };
}
