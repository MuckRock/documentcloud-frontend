import { breadcrumbTrail } from "$lib/utils/navigation";

import { VIEWER_MAX_AGE } from "@/config/config.js";

export async function load({ parent, setHeaders }) {
  const { me } = await parent();
  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: "/documents/", title: "Documents" },
  ]);

  if (!me) {
    setHeaders({
      "max-age": `public, max-age=${VIEWER_MAX_AGE}`,
    });
  }

  return {
    breadcrumbs,
  };
}
