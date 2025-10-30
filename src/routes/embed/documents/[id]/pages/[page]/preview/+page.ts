// load data for a single page embed
import { error } from "@sveltejs/kit";

import { EMBED_MAX_AGE } from "@/config/config.js";
import * as documents from "$lib/api/documents";

export async function load({ params, fetch, setHeaders }) {
  const page = +params.page;
  let document = await documents.get(+params.id, fetch);

  if (document.error || !document.data) {
    return error(404, "Document not found");
  }

  setHeaders({
    "Cloudflare-CDN-Cache-Control": `public, max-age=${EMBED_MAX_AGE}`,
    "last-modified": new Date(document.data.updated_at).toUTCString(),
  });

  return {
    document: document.data,
    page: +page,
  };
}
