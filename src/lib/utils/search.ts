import { APP_URL } from "@/config/config";

export function searchUrl(query: string): URL {
  const href = new URL("app", APP_URL);
  href.searchParams.set("q", query);
  return href;
}

export function projectSearchUrl(project): string {
  return searchUrl(`+project:${project.id} `).toString();
}
