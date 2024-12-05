import { redirect } from "@sveltejs/kit";
import { userDocs } from "$lib/utils/search";

export async function load({ parent, url }) {
  const { me } = await parent();
  const u = new URL(url);

  if (me) {
    u.pathname = "/documents/";
    u.searchParams.set("q", userDocs(me));
    return redirect(302, u);
  }

  u.pathname = "/home/";
  return redirect(302, u);
}
