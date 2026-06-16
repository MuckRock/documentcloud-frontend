/** Date fields whose range bounds must carry Solr time suffixes. */
export const DATE_FIELDS = new Set(["created_at", "updated_at"]);

/** Format a date value for Solr. Bare YYYY-MM-DD dates need time suffixes.
 *  Returns a clean (unescaped) value — colons are escaped only at serialize
 *  time via {@link escapeRangeBound}. */
export function formatDateBound(
  value: string,
  position: "lower" | "upper",
): string {
  if (value === "*" || !value) return value;
  // Already has time component or is date math (NOW-...)
  if (/T|NOW/.test(value)) return value;
  // Bare date: append time
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return position === "lower" ? `${value}T00:00:00Z` : `${value}T23:59:59Z`;
  }
  return value;
}

// Lucene treats `:` as the field/value separator, so an unescaped colon inside
// a range bound (e.g. the `00:00:00` of an ISO timestamp) makes Solr silently
// drop the clause. Bounds are stored unescaped on the node — readable in the
// editor and parseable by the frontend lucene parser — and escaped only when
// serialized to the query string sent to Solr.

/** Escape colons in a range bound for the serialized Solr query. */
export function escapeRangeBound(value: string): string {
  return value.replace(/:/g, "\\:");
}

/** Reverse {@link escapeRangeBound}, restoring a clean bound for the node. */
export function unescapeRangeBound(value: string): string {
  return value.replace(/\\:/g, ":");
}
