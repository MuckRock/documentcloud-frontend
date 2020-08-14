/**
 * Methods related to the DocumentCloud CMS
 */

import session from "./session";
import { urlJoin } from '@/util/url';

export async function getContent(url) {
  // Reprocess the documents with the specified ids
  const { data } = await session.get(
    urlJoin(process.env.DC_BASE, 'pages', url),
  );
  return data;
}
