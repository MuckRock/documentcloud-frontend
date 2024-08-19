import { getOwned, getShared } from "$lib/api/projects";
import type { Project } from "@/api/types";

export async function load({ url, parent, fetch }) {
  const { me } = await parent();
  const params = Object.fromEntries(url.searchParams.entries());
  const list = params.list ?? "owned";
  const query = params.query ?? "";
  let projects: Project[] = [];

  if (me && list === "owned") {
    projects = await getOwned(me.id, query, fetch).catch((e) => {
      console.error(e);
      return [];
    });
  } else if (me && list === "shared") {
    projects = await getShared(me.id, query, fetch).catch((e) => {
      console.error(e);
      return [];
    });
  }

  return {
    list,
    projects,
  };
}
