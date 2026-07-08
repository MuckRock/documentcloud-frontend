// load homepage data

import type { Document } from "$lib/api/types";

import { PAGE_MAX_AGE } from "@/config/config.js";
import { getMe } from "$lib/api/accounts";
import { search, list } from "$lib/api/documents.js";
import { getTrendingDocumentIds } from "$lib/api/cloudflare";

export const trailingSlash = "ignore";

// How many trending documents to show on the homepage.
const TRENDING_LIMIT = 5;

/**
 * Resolve trending document IDs into full document records, preserving the
 * popularity order. Returns an empty list if analytics is unavailable or none
 * of the trending documents are publicly accessible.
 */
async function getTrendingDocuments(
  fetch: typeof globalThis.fetch,
): Promise<Document[]> {
  const ids = await getTrendingDocumentIds(fetch);
  if (ids.length === 0) return [];

  const { data } = await list({ id__in: ids.join(",") }, fetch);
  const documents = data?.results ?? [];

  // The API doesn't preserve id__in order, so re-rank by popularity.
  const byId = new Map(documents.map((doc) => [String(doc.id), doc]));

  return ids
    .map((id) => byId.get(id))
    .filter((doc): doc is Document => Boolean(doc))
    .slice(0, TRENDING_LIMIT);
}

export async function load({ fetch, cookies, setHeaders }) {
  const sessionId = cookies.get("sessionid");

  const [me, { data }, trendingDocuments] = await Promise.all([
    sessionId ? getMe(fetch) : Promise.resolve(null),
    search("", { per_page: 1 }),
    getTrendingDocuments(fetch),
  ]);

  if (!me) {
    setHeaders({
      "cache-control": `public, max-age=${PAGE_MAX_AGE}`,
    });
  }

  return {
    documentCount: data?.count,
    me,
    trendingDocuments,
  };
}
