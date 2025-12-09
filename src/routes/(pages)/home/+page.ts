// load homepage data
import { error } from "@sveltejs/kit";

import { PAGE_MAX_AGE } from "@/config/config.js";
import * as flatpages from "$lib/api/flatpages";
import { getMe } from "$lib/api/accounts";
import { renderMarkdown } from "$lib/utils/markup";
import { ALLOWED_TAGS } from "@/config/config.js";

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
    content: renderMarkdown(page.content, {
      allowedTags: ALLOWED_TAGS.concat("h1", "h2", "h3", "h4", "h5", "h6"),
    }),
    me,
  };
}
