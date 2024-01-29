// load data for flatpages
import { error, redirect } from "@sveltejs/kit";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";

import { BASE_API_URL } from "@/config/config.js";

marked.use(gfmHeadingId());

const ROOT = new URL("flatpages/", BASE_API_URL);

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  const endpoint = new URL(params.path, ROOT);

  const resp = await fetch(endpoint, { credentials: "include" });

  if (resp.status > 400) {
    error(resp.status, resp.statusText);
  }

  // we should be following redirects, so this shouldn't happen
  if (resp.status > 300) {
    redirect(resp.status, resp.headers.get("Location"));
  }

  const page = await resp.json();

  page.content = DOMPurify.sanitize(marked.parse(page.content));

  return page;
}
