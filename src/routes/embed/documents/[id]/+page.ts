// redirect /documents/id/ to /documents/id-slug/
import { error, redirect } from "@sveltejs/kit";
import * as documents from "$lib/api/documents";

// save a redirect
export const trailingSlash = "ignore";

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch, url }) {
  const { data: document, error: err } = await documents.get(+params.id, fetch);
  if (err) {
    console.warn(err.status, url.href);
    return error(err.status, err.message);
  }

  if (!document) {
    return error(404, "Document not found");
  }
  const canonical = documents.embedUrl(document);

  return redirect(308, canonical);
}
