// load data for flatpages
import { error, redirect, type NumericRange } from "@sveltejs/kit";
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import DOMPurify from "isomorphic-dompurify";

import { BASE_API_URL } from "@/config/config.js";

marked.use(gfmHeadingId());

const ROOT = new URL("flatpages/", BASE_API_URL);

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
  const endpoint = new URL(params.path, ROOT);

  const resp = await fetch(endpoint, { credentials: "include" });

  if (resp.status > 400) {
    error(resp.status as NumericRange<400, 599>, resp.statusText);
  }

  // we should be following redirects, so this shouldn't happen
  if (resp.status > 300) {
    redirect(
      resp.status as NumericRange<300, 308>,
      resp.headers.get("Location"),
    );
  }

  const page = await resp.json();

  return {
    title: page.title,
    url: page.url,
    content: render(page.content),
  };
}

function render(content) {
  return DOMPurify.sanitize(marked.parse(content));
}
