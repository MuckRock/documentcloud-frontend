import type { Action } from "svelte/action";

type Breadcrumb = { href?: string; title: string };
type Parent = () => Promise<{ breadcrumbs?: Array<Breadcrumb> }>;

/** Returns a trail of breadcrumbs, built upon the parent's trail.
 *  Primarily for use in `+layout.ts` and `+page.ts` files.
 */
export async function breadcrumbTrail(
  parent: Parent,
  crumbs: Array<Breadcrumb> = [],
) {
  const { breadcrumbs: trail = [] } = await parent();
  return trail.concat(crumbs);
}

/**
 * Make a link preserve existing query params and merge in new ones
 *
 * @type {Action}
 * @param node
 */
export function qs(node: HTMLAnchorElement) {
  if (typeof window === "undefined") return;

  const href = new URL(node.href);
  const params = new URLSearchParams(window.location.search);

  for (const [k, v] of href.searchParams) {
    params.set(k, v);
  }

  href.search = params.toString();
  node.href = href.toString();
}
