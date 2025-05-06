import { redirect } from "@sveltejs/kit";
import { userDocs } from "$lib/utils/search";

export const trailingSlash = "ignore";

export async function load({ parent, url }) {
  const { me } = await parent();
  const u = new URL(url);

  if (me) {
    u.pathname = "/documents/";
    u.searchParams.set("q", userDocs(me));
    return redirect(307, u);
  }

  u.pathname = "/home/";
  return redirect(307, u);
}
