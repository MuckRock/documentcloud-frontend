import type { ViewerMode } from "@/lib/api/types.js";
import * as documents from "$lib/api/documents";

export async function load({ fetch, parent }) {
  const { document } = await parent();
  const asset_url = await documents.assetUrl(document, fetch);
  const mode: ViewerMode = "annotating";

  return {
    asset_url,
    mode,
  };
}
