// redirect /app to /

import { redirect } from "@sveltejs/kit";

export function GET({ url }) {
  const u = new URL(url);

  // change the path but preserve other parts of the URL
  u.pathname = "/documents/";

  return redirect(308, u);
}
