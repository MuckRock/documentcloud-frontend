// load homepage data

import { PAGE_MAX_AGE } from "@/config/config.js";
import { getMe } from "$lib/api/accounts";
import { search } from "$lib/api/documents.js";

export const trailingSlash = "ignore";

export async function load({ fetch, cookies, setHeaders }) {
  const sessionId = cookies.get("sessionid");
  const me = sessionId ? await getMe(fetch) : null;

  const { data } = await search("", { per_page: 1 });

  if (!me) {
    setHeaders({
      "cache-control": `public, max-age=${PAGE_MAX_AGE}`,
    });
  }

  return {
    documentCount: data?.count,
    me,
  };
}
