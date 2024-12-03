import { redirect } from "@sveltejs/kit";

import { EMBED_URL } from "@/config/config.js";

// redirect to embed route
export function load({ url }) {
  const u = new URL(url);

  u.searchParams.set("embed", "1");
  u.hostname = EMBED_URL;

  return redirect(302, u);
}
