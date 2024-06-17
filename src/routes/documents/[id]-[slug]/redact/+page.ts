import * as documents from "$lib/api/documents";

export async function load({ fetch, parent, data }) {
  const { document } = await parent();
  const asset_url = await documents.assetUrl(document, fetch);

  return {
    ...(data || {}),
    asset_url,
  };
}
