// Accounts links here by uuid, but search only takes numeric ids.

import { error, redirect } from "@sveltejs/kit";

import { SIGN_IN_URL } from "@/config/config.js";
import { listUsers } from "$lib/api/accounts";
import { searchUrl, userDocs } from "$lib/utils/search";

export const trailingSlash = "ignore";

export async function load({ params, parent, url, fetch }) {
  const { me } = await parent();

  // looking up users by uuid requires a login
  if (!me) {
    return redirect(
      302,
      new URL(`?next=${encodeURIComponent(url.href)}`, SIGN_IN_URL),
    );
  }

  const { data, error: err } = await listUsers({ uuid: params.uuid }, fetch);

  if (err) {
    return error(err.status, err.message);
  }

  const user = data?.results[0];

  if (!user) {
    return error(404, "User not found");
  }

  return redirect(302, searchUrl(userDocs(user)));
}
