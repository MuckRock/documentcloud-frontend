import { writable } from "svelte/store";
import { baseApiUrl } from "../../api/base.js";

export const filter = writable("featured");

export const FILTERS = [
  ["all", "All"],
  ["active", "Pinned"],
  ["featured", "Featured"],
  ["premium", "Premium"],
];

export const CATEGORIES = [
  ["export", "Export"],
  ["ai", "AI"],
  ["bulk", "Bulk"],
  ["extraction", "Extraction"],
  ["file", "File"],
  ["monitor", "Monitor"],
  ["statistical", "Statistical"],
];

export function buildParams({
  query = "",
  per_page = 5,
  filter = [],
}: {
  query: string;
  per_page: number;
  filter: string | string[];
}) {
  if (!Array.isArray(filter)) {
    filter = [filter];
  }
  const params = { per_page, query, filters: {} };
  const filters = FILTERS.map(([n]) => n).filter((n) => filter.includes(n));
  const categories = CATEGORIES.map(([n]) => n).filter((n) =>
    filter.includes(n),
  );
  params.filters = filters.reduce((m, f) => {
    if (f !== "all") {
      m[f] = true;
    }
    return m;
  }, {});

  if (categories.length) {
    params.filters["category"] = categories.join(",");
  }

  return params;
}

export function buildUrl({ query = "", filters = {}, per_page = 5 }) {
  const u = new URL("addons/", baseApiUrl);

  u.search = new URLSearchParams({
    query,
    per_page: String(per_page),
    ...filters,
  }).toString();

  return u.toString();
}
