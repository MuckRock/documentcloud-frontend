import session from "./session.js";
import { apiUrl } from "./base.js";
import { Entities } from "@/structure/entity.js";
import { queryBuilder } from "@/util/url.js";

export async function extractEntities(id) {
  const url = apiUrl(`documents/${id}/legacy_entities_2/`);
  const { data } = await session.post(url);
  return data;
}

export async function getEntities(id, nextUrl, filters) {
  // Returns annotations for the specified document
  var url;
  if (nextUrl === null) {
    url = apiUrl(queryBuilder(`documents/${id}/legacy_entities_2/`, filters));
  } else {
    url = nextUrl;
  }
  const { data } = await session.get(url);
  return new Entities(url, data);
}
