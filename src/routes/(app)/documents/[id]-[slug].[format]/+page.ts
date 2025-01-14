// handle .html and other file extension routes from old versions of DocumentCloud

import { error, redirect } from "@sveltejs/kit";
import * as documents from "$lib/api/documents";

export const trailingSlash = "never";

export async function load({ params, fetch }) {
  const { id, slug, format } = params;

  const { data: document, error: err } = await documents.get(id, fetch);

  if (err) {
    return error(err.status, err.message);
  }

  if (!document) {
    return error(404, "Not found");
  }

  const canonical = `/documents/${id}-${slug}/`;

  let url: URL;

  switch (format) {
    // for .html, redirect to embed
    case "html":
      url = documents.embedUrl(document);
      return redirect(302, url);

    case "txt":
      url = documents.canonicalUrl(document);
      url.searchParams.set("mode", "text");
      return redirect(302, url);

    // redirect to the PDF file, no-op for errors
    case "pdf":
      url = documents.pdfUrl(document);
      return redirect(302, url);

    // fallback: redirect to the canonical path, on the same host
    default:
      return redirect(302, canonical);
  }
}
