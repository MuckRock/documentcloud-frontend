// api utilities for embeds

import type { OEmbed } from "./types";
import { BASE_API_URL } from "@/config/config.js";

/**
 * Generate an oembed URL for a given DocumentCloud URL
 * @export
 */
export function embedUrl(url: URL | string): URL {
  const endpoint = new URL("oembed/", BASE_API_URL);
  endpoint.searchParams.set("url", url.toString());
  return endpoint;
}

/**
 * Fetch embed code from the OEmbed API endpoint
 * @deprecated
 * @export
 */
export async function getEmbed(url: URL | string): Promise<OEmbed> {
  const endpoint = embedUrl(url);

  return fetch(endpoint, { credentials: "include" }).then((r) => r.json());
}
