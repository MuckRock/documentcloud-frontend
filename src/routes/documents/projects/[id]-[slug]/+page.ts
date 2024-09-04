import { error, redirect } from "@sveltejs/kit";

import { DEFAULT_PER_PAGE } from "@/config/config.js";
import * as projects from "$lib/api/projects";
import * as collaborators from "$lib/api/collaborators";
import { search } from "$lib/api/documents";
import { breadcrumbTrail } from "$lib/utils/navigation";

export async function load({ params, url, parent, fetch }) {
  const id = parseInt(params.id);
  const [project, users] = await Promise.all([
    projects.get(id, fetch).catch(console.error),
    collaborators.list(id, fetch).catch(console.error),
  ]).catch((e) => {
    return [];
  });

  if (!project) {
    error(404, "Project not found");
  }

  if (project.slug !== params.slug) {
    const canonical = projects.canonicalUrl(project);
    redirect(302, canonical);
  }

  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: url.pathname, title: project.title },
  ]);

  const query = url.searchParams.get("q") ?? "";
  const cursor = url.searchParams.get("cursor") ?? "";
  const per_page = +url.searchParams.get("per_page") || DEFAULT_PER_PAGE;
  const documents = search(
    query,
    { cursor, project: project.id, per_page },
    fetch,
  );

  return {
    breadcrumbs,
    documents,
    query,
    project,
    users,
  };
}
