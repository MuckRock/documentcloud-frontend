import { breadcrumbTrail } from "$lib/utils/navigation";

export async function load({ url, fetch, parent }) {
  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: "/app/add-ons", title: "Add-Ons" },
  ]);
  return {
    breadcrumbs,
  };
}