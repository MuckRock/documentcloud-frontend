// load homepage data
import { error } from "@sveltejs/kit";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";

import * as flatpages from "$lib/api/flatpages";
import { getMe } from "$lib/api/accounts";

marked.use(gfmHeadingId());

export async function load({ fetch }) {
  const [{ data: page, error: err }, me] = await Promise.all([
    flatpages.get("/home/", fetch),
    getMe(fetch),
  ]);

  if (err) {
    return error(err.status, { message: err.message });
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
