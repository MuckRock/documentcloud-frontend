/**
 * Methods related to the DocumentCloud CMS
 */

import session from "./session.js";
import { urlJoin } from "../util/url.js";

export async function getContent(url) {
  const { data } = await session.get(
    urlJoin(process.env.DC_BASE, "pages", url),
  );
  return data;
}

export async function getFlatpage(page) {
  const { data } = await session.get(process.env.DC_BASE + "/pages/" + page);
  return data;
}
