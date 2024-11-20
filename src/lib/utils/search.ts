import type { Nullable, Project, User } from "$lib/api/types";
import type { Access } from "../api/types";
import { APP_URL } from "@/config/config.js";
import { slugify } from "$lib/utils/slugify";
import { getUserName } from "../api/accounts";

export function searchUrl(query: string): URL {
  const href = new URL("documents/", APP_URL);
  href.searchParams.set("q", query);
  return href;
}

export function projectSearchUrl(project: Project): string {
  return searchUrl(`+project:${project.id} `).href;
}

/**
 * Generate search params for a user's documents
 * @param user
 * @param access
 */
export function userDocs(user?: Nullable<User>, access?: Access): string {
  if (!user) return "";
  const username = getUserName(user);
  if (access) {
    return `+user:${slugify(username)}-${user.id} access:${access}`;
  }

  return `+user:${slugify(username)}-${user.id}`;
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
  return `+data_${key}:"${value}"`;
}

/**
 * Find `query` in `contents` and add `<mark>` tags
 * @param contents
 * @param query
 * @returns html with <mark> tags
 */
export function highlight(contents: string, query: string): string {
  if (!query) return contents;

  const re = new RegExp(query, "gi");
  return contents.replaceAll(re, (match) => `<mark>${match}</mark>`);
}

/**
 * Parse the page number from a search highlight key.
 */
export function pageNumber(page: string): number {
  const PAGE_NO_RE = /^page_no_(\d+)$/;
  const match = PAGE_NO_RE.exec(page);
  if (!match || !match[1]) return NaN;
  const number = parseInt(match[1]);
  return number;
}

export function getQuery(url: URL, param: string = "q"): string {
  if (!url) {
    console.error("Missing URL");
  }
  return url?.searchParams?.get(param) ?? "";
}
