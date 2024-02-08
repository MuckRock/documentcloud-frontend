import { error, redirect } from "@sveltejs/kit";
import { BASE_API_URL } from "@/config/config.js";
import * as documents from "$lib/api/documents.js";

const EXPAND = "user,organization";

/**
 * @type {import('./$types').PageLoad}
 *
 * @export
 *
 * We do this in a layout module because sub-routes can use the same
 * document without loading it again.
 */
export async function load({ fetch, params }) {
  const document = await documents.get(params.id, fetch);

  if (document.slug !== params.slug) {
    const canonical = new URL(document.canonical_url);
    redirect(302, canonical.pathname);
  }

  return { document };
}
