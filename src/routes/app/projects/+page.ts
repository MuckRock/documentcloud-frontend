import { getOwned, getShared } from "$lib/api/projects";
import type { Project } from "@/api/types";

export async function load({ url, parent, fetch }) {
  const { me } = await parent();
  const params = Object.fromEntries(url.searchParams.entries());
  const list = params.list ?? "owned";
  const query = params.query;
  let projects: Project[];
  if (list === "owned") {
    projects = await getOwned(me.id, query);
  } else if (list === "shared") {
    projects = await getShared(me.id, query);
  }

  return {
    list,
    projects,
  };
}
