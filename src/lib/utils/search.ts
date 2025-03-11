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

export interface ParsedText {
  type: "text";
  text: string;
  quoted: boolean;
  regex: boolean;
  prefix?: string;
}

export interface ParsedTerm {
  type: "term";
  value: string;
  field?: string;
  boost?: number;
  prefix?: string;
  quoted: boolean;
}

export interface ParsedRange {
  type: "range";
  field: string;
  lowerBound?: string;
  upperBound?: string;
  inclusive: [boolean, boolean];
}

export interface ParsedExpression {
  type: "expression";
  operator?: string;
  left: ParsedNode;
  right?: ParsedNode;
}

export type ParsedNode =
  | ParsedText
  | ParsedTerm
  | ParsedRange
  | ParsedExpression;

export const IMPLICIT = "<implicit>";

export function parseQuery(query: string): ParsedNode {
  // Handle empty queries directly
  if (!query || !query.trim()) {
    return { type: "text", text: "", quoted: false, regex: false };
  }

  try {
    const ast = lucene.parse(query) as lucene.AST | lucene.Node;
    console.debug("Parsed AST:", ast);
    return processNode(ast);
  } catch (error) {
    console.error("Failed to parse query:", error);
    // Allow errors to propagate up
    throw error;
  }
}

function processNode(node: any): ParsedNode {
  if (!node) return { type: "term", value: "", quoted: false };

  // Handle raw nodes
  if (node.field === IMPLICIT) {
    return {
      type: "text",
      text: node.term,
      quoted: node.quoted,
      regex: node.regex,
      prefix: node.prefix,
    };
  }

  // Handle range nodes
  if ("term_min" in node && "term_max" in node) {
    return {
      type: "range",
      field: node.field || "",
      lowerBound: node.term_min,
      upperBound: node.term_max,
      inclusive: [
        node.inclusive_min !== undefined ? node.inclusive_min : true,
        node.inclusive_max !== undefined ? node.inclusive_max : true,
      ],
    };
  }

  // Handle term nodes
  if ("term" in node) {
    return {
      type: "term",
      value: node.term || "",
      field: node.field,
      boost: node.boost,
      prefix: node.prefix,
      quoted: node.quoted || false,
    };
  }

  // Handle expression nodes (binary operators like AND, OR, etc.)
  if ("left" in node) {
    const result: ParsedExpression = {
      type: "expression",
      left: processNode(node.left),
    };

    // Handle explicit operators (AND, OR, NOT) and the implicit operator
    if (node.operator) {
      result.operator = node.operator;
    } else if (node.right) {
      // If there's a right side but no explicit operator, it's an implicit operator
      result.operator = IMPLICIT;
    }

    if (node.right) {
      result.right = processNode(node.right);
    }

    return result;
  }

  // Fallback
  return { type: "term", value: "", quoted: false };
}

// Helper function to convert the parsed AST back to a string
export function stringifyParsedNode(node: ParsedNode): string {
  if (node.type === "term") {
    const { field, value, boost, prefix, quoted } = node;
    let result = "";

    if (field) {
      result += `${field}:`;
    }

    if (prefix) {
      result += prefix;
    }

    if (quoted) {
      result += `"${value}"`;
    } else {
      result += value;
    }

    if (boost) {
      result += `^${boost}`;
    }

    return result;
  }

  if (node.type === "range") {
    const { field, lowerBound, upperBound, inclusive } = node;
    const start = inclusive[0] ? "[" : "{";
    const end = inclusive[1] ? "]" : "}";

    return `${field}:${start}${lowerBound || ""} TO ${upperBound || ""}${end}`;
  }

  if (node.type === "expression") {
    const { left, operator, right } = node;
    const leftStr = stringifyParsedNode(left);

    if (!right) {
      return leftStr;
    }

    const rightStr = stringifyParsedNode(right);
    let op = " "; // Default for implicit operator is a space

    if (operator && operator !== IMPLICIT) {
      op = ` ${operator} `; // Explicit operators get spaces on both sides
    }

    return `${leftStr}${op}${rightStr}`;
  }

  return "";
}
