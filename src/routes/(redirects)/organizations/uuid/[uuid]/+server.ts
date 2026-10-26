// Accounts links here by uuid, but search only takes numeric ids.

import { error, redirect } from "@sveltejs/kit";

import { SIGN_IN_URL } from "@/config/config.js";
import { listOrgs } from "$lib/api/accounts";
import { searchUrl, orgDocs } from "$lib/utils/search";

export async function GET({ params, url, cookies, fetch }) {
  const signIn = new URL(`?next=${encodeURIComponent(url.href)}`, SIGN_IN_URL);

  // looking up organizations by uuid requires a login
  if (!cookies.get("sessionid")) {
    return redirect(302, signIn);
  }

  const { data, error: err } = await listOrgs({ uuid: params.uuid }, fetch);

  // the session cookie has expired
  if (err?.status === 401 || err?.status === 403) {
    return redirect(302, signIn);
  }

  if (err) {
    return error(err.status, err.message);
  }

  const org = data?.results[0];

  if (!org) {
    return error(404, "Organization not found");
  }

  return redirect(302, searchUrl(orgDocs(org)));
}
