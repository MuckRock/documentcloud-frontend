import type { User } from "@/api/types";
import type { Access } from "../api/types";
import { APP_URL } from "@/config/config.js";
import { slugify } from "@/util/string.js";

export function searchUrl(query: string): URL {
  const href = new URL("app/", APP_URL);
  href.searchParams.set("q", query);
  return href;
}

export function projectSearchUrl(project): string {
  return searchUrl(`+project:${project.id} `).href;
}

/**
 * Generate search params for a user's documents
 * @param user
 * @param access
 */
export function userDocs(user: User, access: Access): string {
  return `+user:${slugify(user.name)}-${user.id} access:${access}`;
}

/**
 * Tag search query
 * @param t tag
 * @returns formatted query
 */
export function tag(t: string): string {
  return `+tag:"${t}"`;
}

/**
 * Data search query
 * @param key
 * @param value
 * @returns formatted query
 */
export function kv(key: string, value: string): string {
  return `+data__${key}:"${value}"`;
}
