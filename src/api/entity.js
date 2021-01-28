import session from "./session";
import { apiUrl } from "./base";
import { Entities } from '@/structure/entity';
import { queryBuilder } from "@/util/url";

export async function extractEntities(id) {
  const url = apiUrl(`documents/${id}/entities/`);
  const { data } = await session.post(url);
  return data;
}

export async function getEntities(id, page = 1, filters) {
  // Returns annotations for the specified document
  const url = apiUrl(queryBuilder(`documents/${id}/entities/`, { page, ...filters }));
  const { data } = await session.get(
    url
  );
  return new Entities(url, data);
}
