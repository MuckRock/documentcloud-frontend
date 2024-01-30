// load homepage data
import { error } from "@sveltejs/kit";
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";

import { BASE_API_URL } from "@/config/config.js";

marked.use(gfmHeadingId());

const ROOT = new URL("flatpages/", BASE_API_URL);
const endpoint = new URL("home/", ROOT);

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  const resp = await fetch(endpoint, { credentials: "include" });

  if (!resp.ok) {
    error(resp.status, resp.statusText);
  }

  const page = await resp.json();

  return {
    title: page.title,
    url: page.url,
    content: render(page.content),
  };
}

function render(content) {
  // TODO sanitize content
  console.warn("FlatPage content is not sanitized");
  return marked.parse(content);
}
