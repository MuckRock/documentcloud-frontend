import * as projectApi from "$lib/api/projects";
import { breadcrumbTrail } from "$lib/utils/navigation";

export async function load({ params, url, parent, fetch }) {
  const id = parseInt(params.id);
  const project = await projectApi.get(id, fetch);
  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: url.pathname, title: project.title },
  ]);
  const documents = projectApi.documents(id, fetch);
  return {
    breadcrumbs,
    project,
    documents,
  };
}
