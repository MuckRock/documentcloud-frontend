import session from "./session";
import { apiUrl } from "./base";
import { Entities } from '@/structure/entity';
import { queryBuilder } from "@/util/url";

import { page1, page2 } from './mockEntity';

export async function extractEntities(id) {
  const url = apiUrl(`documents/${id}/entities/`);
  const { data } = await session.post(url);
  return data;
}

export async function getEntities(id, page = 1) {
  // const url = apiUrl(queryBuilder(`documents/${id}/entities/`, { page }));
  // if (page == 1) {
  //   const data = page1;
  //   return new Entities(url, data);
  // } else {
  //   const data = page2;
  //   return new Entities(url, data);
  // }

  // Returns annotations for the specified document
  const url = apiUrl(queryBuilder(`documents/${id}/entities/`, { page }));
  const { data } = await session.get(
    url
  );
  return new Entities(url, data);
}
