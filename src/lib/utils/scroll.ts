import { pageHashUrl } from "../api/documents";

/**
 * Scroll to a page using a standard ID
 *
 * @param n page number
 */
export function scrollToPage(n: number): void {
  const pageId = pageHashUrl(n).replace("#", "");
  const heading = window.document.getElementById(pageId);

  if (!heading) return console.error(`Missing page ${n}`);
  heading.scrollIntoView();
}
