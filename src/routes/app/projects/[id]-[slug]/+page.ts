import * as projectApi from "$lib/api/projects";
import { search } from "$lib/api/documents";
import { breadcrumbTrail } from "$lib/utils/navigation";

export async function load({ params, url, parent, fetch }) {
  const id = parseInt(params.id);
  const project = await projectApi.get(id, fetch);
  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: url.pathname, title: project.title },
  ]);
  const query = url.searchParams.get("q") ?? "";
  const cursor = url.searchParams.get("cursor") ?? "";
  const documents = search(query, { cursor, project: project.id });
  return {
    breadcrumbs,
    project,
    documents,
    query,
  };
}
