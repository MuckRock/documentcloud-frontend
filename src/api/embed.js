import session from './session';
import { apiUrl } from "./base";

export function embedUrl(url) {
  return apiUrl(`oembed?url=${encodeURIComponent(url)}`)
}

export async function getEmbed(url) {
  const { data } = await session.get(
    embedUrl(url)
  );
  return data;
}
