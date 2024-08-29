import type { DocumentText } from "$lib/api/types.js";

/* when we get to node 22
import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).href;
*/

import * as documents from "$lib/api/documents";

export async function load({ fetch, parent, url, data, depends }) {
  const query = url.searchParams.get("q") ?? "";

  const { document, mode } = await parent();

  // only load text in text mode
  let text: Promise<DocumentText> = Promise.resolve({
    updated: 0,
    pages: [],
  });

  if (mode === "text") {
    text = documents.text(document, fetch);
  }

  const asset_url = await documents.assetUrl(document, fetch);

  // so we can reload when we reprocess
  depends(`document:${document.id}`);

  // this needs node 22
  // const task = pdfjs.getDocument({ url: asset_url });

  return {
    ...(data ?? {}), // include csrf_token
    asset_url,
    query,
    text,
    // pdfTask: task,
  };
}
