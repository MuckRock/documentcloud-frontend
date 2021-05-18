import session from "./session";
import { apiUrl } from "./base";
import { queryBuilder } from "@/util/url";

export function embedUrl(url) {
  return apiUrl(`oembed?url=${encodeURIComponent(url)}`);
}

export async function getEmbed(url, options = {}) {
  const { data } = await session.get(
    queryBuilder(apiUrl("oembed"), {
      url,
      maxwidth: options.width,
      maxheight: options.height,
    }),
  );
  return data;
}
