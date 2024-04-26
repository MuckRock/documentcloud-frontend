import type { DocumentText } from "$lib/api/types";

import { jsonUrl } from "$lib/api/documents";
import { error } from "@sveltejs/kit";
import { isErrorCode } from "@/lib/utils/api.js";

export async function load({ fetch, parent }) {
  const { document } = await parent();
  const url = jsonUrl(document);

  const resp = await fetch(url).catch(console.error);

  if (!resp) {
    error(500, "Server error");
  }

  if (isErrorCode(resp.status)) {
    error(resp.status, resp.statusText);
  }

  const text: DocumentText = await resp.json();

  return {
    pages: text.pages,
  };
}
