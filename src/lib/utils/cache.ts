import * as env from "$env/static/private";

import Cloudflare from "cloudflare";

export async function purge(
  urls: URL[],
): Promise<Cloudflare.Cache.CachePurgeResponse | null | undefined> {
  if (!env.CLOUDFLARE_ID || !env.CLOUDFLARE_TOKEN) return;

  const client = new Cloudflare({
    apiToken: env.CLOUDFLARE_TOKEN,
  });

  return client.cache.purge({
    zone_id: env.CLOUDFLARE_ID,
    files: urls.map((url) => url.toString()),
  });
}
