import { VIEWER_MAX_AGE } from "@/config/config.js";
import { breadcrumbTrail } from "$lib/utils/navigation";

export async function load({ parent, setHeaders }) {
  const { me } = await parent();
  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: "/add-ons/", title: "Add-Ons" },
  ]);

  if (!me) {
    setHeaders({
      "cache-control": `public, max-age=${VIEWER_MAX_AGE}`,
    });
  }

  return {
    breadcrumbs,
  };
}
