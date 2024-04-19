import { getOwned, getShared } from "$lib/api/projects";
import { breadcrumbTrail } from "$lib/utils/navigation";
import type { Project } from "@/api/types";

export async function load({ url, parent, fetch }) {
  const { me } = await parent();
  const params = Object.fromEntries(url.searchParams.entries());
  const list = params.list ?? "owned";
  let projects: Project[];
  if (list === "owned") {
    projects = await getOwned(me.id);
  } else if (list === "shared") {
    projects = await getShared(me.id);
  }
  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: "/projects", title: "Projects" },
  ]);
  return {
    list,
    projects,
    breadcrumbs,
  };
}
