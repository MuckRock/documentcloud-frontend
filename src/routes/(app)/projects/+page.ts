import { list } from "$lib/api/projects";

type ProjectFilter = "owned" | "shared" | "public";

export async function load({ url, parent, fetch }) {
  const { me } = await parent();
  const query = url.searchParams.get("query") ?? "";

  const params: Record<string, any> = { query };

  let filter: ProjectFilter =
    (url.searchParams.get("list") as ProjectFilter) ?? "owned";

  if (me && filter === "owned") {
    params.owned_by_user = true;
  }

  if (me && filter === "shared") {
    params.is_shared = true;
  }

  const projects = list(params, fetch);

  return {
    projects,
    query,
  };
}
