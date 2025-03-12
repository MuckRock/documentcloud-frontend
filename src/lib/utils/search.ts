import lucene from "lucene";

import type { Nullable, Project, User } from "$lib/api/types";
import type { Access } from "../api/types";

import { APP_URL } from "@/config/config.js";
import { slugify } from "$lib/utils/slugify";
import { getUserName } from "../api/accounts";

export function objectToSearchParams<
  T extends Record<string, string | number | boolean | null | undefined>,
>(obj: T): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value != null && value !== undefined) {
      params.set(key, String(value));
    }
  });
  return params;
}

export function searchUrl(query: string): URL {
  const href = new URL("documents/", APP_URL);
  href.searchParams.set("q", query);
  return href;
}

export function projectSearchUrl(project: Project): string {
  return searchUrl(`project:${project.id} `).href;
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
    return `user:${user.id} access:${access}`;
  }

  return `user:${user.id}`;
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

export function getQuery(url?: Nullable<URL>, param: string = "q"): string {
  if (!url) {
    console.warn("Missing URL");
  }
  return url?.searchParams?.get(param) ?? "";
}

/* Lucene is used to parse and construct Solr search queries. */
/* We have a number of helpers that make it easier to work with the AST. */

export function isAST(ast: unknown): ast is lucene.AST {
  if (typeof ast === "object" && ast != null) {
    return Object.hasOwn(ast, "left");
  }
  return false;
}

export function isBinaryAST(ast: unknown): ast is lucene.BinaryAST {
  if (typeof ast === "object" && ast != null) {
    return Object.hasOwn(ast, "right");
  }
  return false;
}

export function isNodeTerm(n: unknown): n is lucene.NodeTerm {
  if (typeof n === "object" && n != null) {
    return Object.hasOwn(n, "term");
  }
  return false;
}

export function isNodeRangedTerm(n: unknown): n is lucene.NodeRangedTerm {
  if (typeof n === "object" && n != null) {
    return Object.hasOwn(n, "term_max");
  }
  return false;
}

/** Walk the tree and apply a function to each leaf node. */
export function walkTree(
  node: lucene.AST | lucene.Node,
  fn: (node: lucene.Node) => void,
) {
  if (isAST(node) && node.left) walkTree(node.left, fn);
  if (isBinaryAST(node) && node.right) walkTree(node.right, fn);
  if (isNodeTerm(node) || isNodeRangedTerm(node)) fn(node);
}
