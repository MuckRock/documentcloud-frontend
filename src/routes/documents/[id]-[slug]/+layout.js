import { error, redirect } from "@sveltejs/kit";
import { BASE_API_URL } from "@/config/config.js";

const EXPAND = "user,organization";

/**
 * @type {import('./$types').PageLoad}
 *
 * @export
 *
 * Load a single document from the API
 * Example: https://api.www.documentcloud.org/api/documents/1/
 *
 * We do this in a layout module because sub-routes can use the same
 * document without loading it again.
 */
export async function load({ fetch, params }) {
  const endpoint = new URL(`documents/${params.id}.json`, BASE_API_URL);

  endpoint.searchParams.set("expand", EXPAND);

  const resp = await fetch(endpoint, { credentials: "include" });

  if (!resp.ok) {
    console.error(endpoint.toString());
    error(resp.status, resp.statusText);
  }

  const document = await resp.json();

  if (document.slug !== params.slug) {
    const canonical = new URL(document.canonical_url);
    redirect(302, canonical.pathname);
  }

  return { document };
}
