import session from './session';
import { apiUrl } from "./base";

export async function getEmbed(url) {
  const { data } = await session.get(
    apiUrl(`oembed?url=${encodeURIComponent(url)}`)
  );
  return data;
}
