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
