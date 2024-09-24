import { breadcrumbTrail } from "$lib/utils/navigation";

export async function load({ parent }) {
  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: "/add-ons/", title: "Add-Ons" },
  ]);
  return {
    breadcrumbs,
  };
}