import type { User } from "@/api/types";
import type { Access } from "../api/types";
import { APP_URL } from "@/config/config";
import { slugify } from "@/util/string.js";

export function searchUrl(query: string): URL {
  const href = new URL("app", APP_URL);
  href.searchParams.set("q", query);
  return href;
}

export function projectSearchUrl(project): string {
  return searchUrl(`+project:${project.id} `).toString();
}

/**
 * Generate search params for a user's documents
 * @param user
 * @param access
 */
export function userDocs(user: User, access: Access): string {
  return `+user:${slugify(user.name)}-${user.id} access:${access}`;
}
