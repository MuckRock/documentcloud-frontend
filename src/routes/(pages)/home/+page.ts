// load homepage data
import { error } from "@sveltejs/kit";

import { PAGE_MAX_AGE } from "@/config/config.js";
import * as flatpages from "$lib/api/flatpages";
import { getMe } from "$lib/api/accounts";
import { renderMarkdown } from "$lib/utils/markup";

export const trailingSlash = "ignore";

export async function load({ fetch, setHeaders }) {
  const [{ data: page, error: err }, me] = await Promise.all([
    flatpages.get("/home/", fetch),
    getMe(fetch),
  ]);

  if (err) {
    return error(err.status, { message: err.message });
  }

  if (!page) {
    return error(404, "Page not found");
  }

  if (!me) {
    setHeaders({
      "Cloudflare-CDN-Cache-Control": `public, max-age=${PAGE_MAX_AGE}`,
    });
  }

  return {
    title: page.title,
    url: page.url,
    content: renderMarkdown(page.content),
    me,
  };
}
