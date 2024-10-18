import { redirect } from "@sveltejs/kit";
import { searchUrl, userDocs } from "$lib/utils/search";

export async function load({ parent }) {
  const { me } = await parent();

  if (me) {
    return redirect(302, searchUrl(userDocs(me)));
  }

  return redirect(302, "/home/");
}
