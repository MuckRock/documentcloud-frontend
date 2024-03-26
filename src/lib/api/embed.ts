// api utilities for embeds

import type { OEmbed } from "./types";
import { BASE_API_URL } from "@/config/config.js";

/**
 * Generate an oembed URL for a given DocumentCloud URL
 *
 * @export
 */
export function embedUrl(url: URL | string): URL {
  return new URL(`oembed/?url=${url.toString()}`, BASE_API_URL);
}

/**
 * Fetch embed code from the OEmbed API endpoint
 *
 * @export
 */
export async function getEmbed(url: URL | string): Promise<OEmbed> {
  const endpoint = embedUrl(url);

  return fetch(endpoint, { credentials: "include" }).then((r) => r.json());
}
