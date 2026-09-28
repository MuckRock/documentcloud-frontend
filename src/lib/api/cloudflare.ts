/** Server-only helper for fetching trending documents from the
 * Cloudflare GraphQL Analytics API.
 * https://developers.cloudflare.com/analytics/graphql-api/
 *
 * We use the Web Analytics (RUM) dataset, which records real browser page
 * loads. Cloudflare filters paths down to the document viewer server-side, then we
 * map `/documents/{id}-{slug}/` back to numeric document IDs so the caller can
 * hydrate them from the API.
 *
 * The API token is a secret and must only be read server-side. If the token
 * or account tag is not configured (e.g. in local dev), we return an empty
 * list so the caller can fall back to static content.
 */
import { env } from "$env/dynamic/private";

const GRAPHQL_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";

// How many days of traffic to aggregate over.
const WINDOW_DAYS = 7;

// How many paths to ask Cloudflare for. One document can span several paths
// (trailing-slash variants), and some trending documents may since have been
// deleted or made private, so we over-fetch and let the caller take the top N.
const PATH_LIMIT = 200;

interface PageloadGroup {
  sum: { visits: number };
  dimensions: { requestPath: string };
}

// Matches the canonical document viewer path, e.g. `/documents/2621-mueller-report/`.
// See `canonicalUrl` in src/lib/api/documents.ts.
const DOCUMENT_PATH = /^\/documents\/(\d+)-/;

// Grouping by `requestPath` alone means Cloudflare sums visits across hosts,
// so a document embedded on embed.documentcloud.org counts toward the same
// path as one viewed on www.documentcloud.org.
const TRENDING_QUERY = `
  query TrendingDocuments($accountTag: String!, $since: Time!, $limit: Int!) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        rumPageloadEventsAdaptiveGroups(
          filter: { datetime_gt: $since, requestPath_like: "/documents/%" }
          orderBy: [sum_visits_DESC]
          limit: $limit
        ) {
          sum {
            visits
          }
          dimensions {
            requestPath
          }
        }
      }
    }
  }
`;

/**
 * Extract ordered, de-duplicated document IDs from a list of Cloudflare
 * page load groups, most-visited first.
 *
 * A single document can appear under several paths (with and without a
 * trailing slash), so visits are summed per document ID before ranking rather
 * than relying on the order Cloudflare returns.
 *
 * Kept separate from the network call so it can be unit tested.
 */
export function parseTrendingDocumentIds(groups: PageloadGroup[]): string[] {
  const visitsById = new Map<string, number>();

  for (const group of groups) {
    const path = group?.dimensions?.requestPath ?? "";
    const match = path.match(DOCUMENT_PATH);
    if (!match) continue;

    const id = match[1];
    if (!id) continue;

    const visits = group?.sum?.visits ?? 0;
    visitsById.set(id, (visitsById.get(id) ?? 0) + visits);
  }

  return [...visitsById.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id);
}

/** ISO 8601 timestamp `days` days before `from`. */
function sinceDatetime(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
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
  const accountTag = env.CLOUDFLARE_ANALYTICS_ACCOUNT_TAG;

  if (!token || !accountTag) return [];

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
          accountTag,
          since: sinceDatetime(WINDOW_DAYS),
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

    const groups: PageloadGroup[] =
      body?.data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups ?? [];

    return parseTrendingDocumentIds(groups);
  } catch (e) {
    console.warn("Failed to fetch trending documents from Cloudflare", e);
    return [];
  }
}
