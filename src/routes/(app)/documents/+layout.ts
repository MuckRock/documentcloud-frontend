import { breadcrumbTrail } from "$lib/utils/navigation";

export async function load({ parent }) {
  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: "/documents/", title: "Documents" },
  ]);

  return {
    breadcrumbs,
  };
}
