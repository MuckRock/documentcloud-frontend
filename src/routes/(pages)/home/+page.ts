// load homepage data
import { error } from "@sveltejs/kit";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";

import { PAGE_MAX_AGE } from "@/config/config.js";
import * as flatpages from "$lib/api/flatpages";
import { getMe } from "$lib/api/accounts";

marked.use(gfmHeadingId());

export const trailingSlash = "always";

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
      "cache-control": `public, max-age=${PAGE_MAX_AGE}`,
    });
  }

  return {
    title: page.title,
    url: page.url,
    content: render(page.content),
    me,
  };
}

function render(content: string): string {
  return DOMPurify.sanitize(marked.parse(content));
}
