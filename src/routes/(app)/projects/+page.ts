import type { ProjectResults } from "$lib/api/types";

import { DEFAULT_PER_PAGE } from "@/config/config.js";
import { getOwned, getShared, list } from "$lib/api/projects";

type ProjectFilter = "owned" | "shared" | "public";

export async function load({ url, parent, fetch }) {
  const { me } = await parent();
  const query = url.searchParams.get("query") ?? "";
  const cursor = url.searchParams.get("cursor") ?? "";
  const per_page = +url.searchParams.get("per_page") || DEFAULT_PER_PAGE;

  const params: Record<string, any> = {
    query,
    cursor,
    per_page,
  };

  const filter: ProjectFilter =
    (url.searchParams.get("list") as ProjectFilter) ?? "owned";

  let projects: ProjectResults = {
    results: [],
    next: null,
    previous: null,
  };

  let error: unknown;

  // for owned and shared, we just get everything at once
  if (me && filter === "owned") {
    projects.results = await getOwned(me.id, query, fetch).catch((e) => {
      console.error(e);
      error = e;
      return [];
    });
  }

  if (me && filter === "shared") {
    projects.results = await getShared(me.id, query, fetch).catch((e) => {
      console.error(e);
      error = e;
      return [];
    });
  }

  // for public, we get the first page and paginate
  if (filter === "public") {
    ({ data: projects, error } = await list(params, fetch));
  }

  return {
    error,
    list: filter,
    projects,
    query,
    cursor,
    per_page,
  };
}
