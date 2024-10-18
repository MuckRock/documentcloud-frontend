import type {
  Project,
  ProjectUser,
  Nullable,
  APIResponse,
} from "$lib/api/types";

import { error, redirect } from "@sveltejs/kit";

import { DEFAULT_PER_PAGE } from "@/config/config.js";
import * as projects from "$lib/api/projects";
import * as collaborators from "$lib/api/collaborators";
import { search } from "$lib/api/documents";
import { breadcrumbTrail } from "$lib/utils/navigation";
import { getPinnedAddons } from "$lib/api/addons";

export async function load({ params, url, parent, data, fetch }) {
  const id = parseInt(params.id, 10);

  const [project, users]: [
    APIResponse<Nullable<Project>>,
    Nullable<ProjectUser[]>,
  ] = await Promise.all([
    projects.get(id, fetch),
    collaborators.list(id, fetch),
  ]).catch(() => {
    return [null, null];
  });

  if (project.error) {
    error(project.error.status, project.error.message);
  }

  if (project.data.slug !== params.slug) {
    const canonical = projects.canonicalUrl(project.data);
    redirect(302, canonical);
  }

  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: url.pathname, title: project.data.title },
  ]);

  const query = url.searchParams.get("q") ?? "";
  const cursor = url.searchParams.get("cursor") ?? "";
  const per_page = +(url.searchParams.get("per_page") || DEFAULT_PER_PAGE);
  const documents = search(
    query,
    { cursor, project: project.data.id, per_page },
    fetch,
  );

  // stream this
  const pinnedAddons = getPinnedAddons(fetch);

  return {
    ...(data ?? {}), // include csrf_token
    breadcrumbs,
    documents,
    query,
    project: project.data,
    users,
    pinnedAddons,
  };
}
