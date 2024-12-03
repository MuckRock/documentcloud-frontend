import type { Maybe, ProjectResults } from "$lib/api/types";

import { DEFAULT_PER_PAGE } from "@/config/config.js";
import { list } from "$lib/api/projects";

type ProjectFilter = "owned" | "shared" | "public";

export async function load({ url, parent, fetch }) {
  const { me } = await parent();
  const query = url.searchParams.get("query") ?? "";
  const cursor = url.searchParams.get("cursor") ?? "";
  const per_page = +(url.searchParams.get("per_page") ?? DEFAULT_PER_PAGE);

  const params: Record<string, any> = {
    query,
    cursor,
    per_page,
  };

  let filter: ProjectFilter =
    (url.searchParams.get("list") as ProjectFilter) ?? "owned";

  if (!me) {
    filter = "public";
  }

  const defaultProjects: ProjectResults = {
    results: [],
    next: null,
    previous: null,
  };

  let data: Maybe<ProjectResults>;
  let error: unknown;

  if (me && filter === "owned") {
    ({ data, error } = await list({ ...params, owned_by_user: true }, fetch));
  }

  if (me && filter === "shared") {
    ({ data, error } = await list({ ...params, is_shared: true }, fetch));
  }

  if (filter === "public") {
    ({ data, error } = await list(params, fetch));
  }

  return {
    error,
    list: filter,
    projects: data ?? defaultProjects,
    query,
    cursor,
    per_page,
  };
}
