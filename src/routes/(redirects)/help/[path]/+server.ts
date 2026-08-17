// redirect /help/ subpages

import { error, redirect } from "@sveltejs/kit";
import { HELP } from "@/config/config.js";

export const trailingSlash = "ignore";

export function GET({ params }) {
  const url = HELP[params.path];

  if (url) {
    return redirect(308, url);
  }

  return error(404, { message: "Not found" });
}
