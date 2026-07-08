/** Server-only helper for fetching trending documents from the
 * Cloudflare GraphQL Analytics API.
 * https://developers.cloudflare.com/analytics/graphql-api/
 *
 * We ask Cloudflare for the most-requested paths on the zone over the last
 * week, then map the document viewer paths (`/documents/{id}-{slug}/`) back
 * to numeric document IDs so the caller can hydrate them from the API.
 *
 * The API token is a secret and must only be read server-side. If the token
 * or zone tag is not configured (e.g. in local dev), we return an empty list
 * so the caller can fall back to static content.
 */
import { env } from "$env/dynamic/private";

const GRAPHQL_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";

// How many days of traffic to aggregate over.
const WINDOW_DAYS = 7;

// How many paths to ask Cloudflare for. Document paths are mixed in with every
// other path on the zone, so we over-fetch and filter down to documents.
const PATH_LIMIT = 200;

interface RequestsGroup {
  count: number;
  dimensions: { clientRequestPath: string };
}

// Matches the canonical document viewer path, e.g. `/documents/2621-mueller-report/`.
// See `canonicalUrl` in src/lib/api/documents.ts.
const DOCUMENT_PATH = /^\/documents\/(\d+)-/;

const TRENDING_QUERY = `
  query TrendingDocuments($zoneTag: String!, $since: String!, $limit: Int!) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        httpRequestsAdaptiveGroups(
          filter: { date_geq: $since, requestSource: "eyeball" }
          orderBy: [count_DESC]
          limit: $limit
        ) {
          count
          dimensions {
            clientRequestPath
          }
        }
      }
    }
  }
`;

/**
 * Extract ordered, de-duplicated document IDs from a list of Cloudflare
 * request groups. Only keeps canonical document viewer paths and preserves the
 * descending-count order Cloudflare returns them in.
 *
 * Kept separate from the network call so it can be unit tested.
 */
export function parseTrendingDocumentIds(groups: RequestsGroup[]): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();

  for (const group of groups) {
    const path = group?.dimensions?.clientRequestPath ?? "";
    const match = path.match(DOCUMENT_PATH);
    if (!match) continue;

    const id = match[1];
    if (!id || seen.has(id)) continue;

    seen.add(id);
    ids.push(id);
  }

  return ids;
}

/** ISO date (YYYY-MM-DD) `days` days before `from`. */
function sinceDate(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Fetch the IDs of the most-visited documents over the last week, ordered
 * most-popular first. Returns an empty list when Cloudflare analytics is not
 * configured or the request fails, so callers can fall back gracefully.
 */
export async function getTrendingDocumentIds(
  fetch = globalThis.fetch,
): Promise<string[]> {
  const token = env.CLOUDFLARE_ANALYTICS_TOKEN;
  const zoneTag = env.CLOUDFLARE_ANALYTICS_ZONE_TAG;

  if (!token || !zoneTag) return [];

  try {
    const resp = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: TRENDING_QUERY,
        variables: {
          zoneTag,
          since: sinceDate(WINDOW_DAYS),
          limit: PATH_LIMIT,
        },
      }),
    });

    if (!resp.ok) return [];

    const body = await resp.json();

    // GraphQL reports errors in the body even on a 200 response.
    if (body?.errors?.length) {
      console.warn("Cloudflare analytics error", body.errors);
      return [];
    }

    const groups: RequestsGroup[] =
      body?.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups ?? [];

    return parseTrendingDocumentIds(groups);
  } catch (e) {
    console.warn("Failed to fetch trending documents from Cloudflare", e);
    return [];
  }
}
