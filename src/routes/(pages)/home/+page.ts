// load homepage data
import { error } from "@sveltejs/kit";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";

import * as flatpages from "$lib/api/flatpages";

marked.use(gfmHeadingId());

export async function load({ fetch }) {
  const { data: page, error: err } = await flatpages.get("/home/", fetch);

  if (err) {
    return error(err.status, { message: err.message });
  }

  return {
    title: page.title,
    url: page.url,
    content: render(page.content),
  };
}

function render(content: string): string {
  return DOMPurify.sanitize(marked.parse(content));
}
