import { breadcrumbTrail } from "$lib/utils/navigation";

export async function load({ parent }) {
  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: "/projects", title: "Projects" },
  ]);
  return {
    breadcrumbs,
  };
}
