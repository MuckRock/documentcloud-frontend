// api utilities for embeds

import { BASE_API_URL } from "@/config/config.js";

/**
 * Generate an oembed URL for a given DocumentCloud URL
 *
 * @export
 * @param {URL | string} url
 * @returns {URL}
 */
export function embedUrl(url) {
  return new URL(`oembed/?url=${url.toString()}`, BASE_API_URL);
}

/**
 * Fetch embed code from the OEmbed API endpoint
 *
 * @export
 * @param {URL | string} url
 * @returns {import('./types').OEmbed}
 */
export async function getEmbed(url) {}
