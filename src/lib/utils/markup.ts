import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import sanitizeHtml, { type IOptions } from "sanitize-html";

import { ALLOWED_ATTR, ALLOWED_TAGS } from "@/config/config.js";

marked.use(gfmHeadingId());

export function renderMarkdown(content: string, options: IOptions = {}) {
  return clean(marked.parse(content), options);
}

/**
 * Render Markdown/HTML down to plain text, stripping all tags.
 * Useful for plain-text contexts like <meta> descriptions.
 */
export function renderText(content: string): string {
  if (!content || typeof content !== "string") return "";

  return clean(marked.parse(content), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, " ")
    .trim();
}

export function clean(html: string, options: IOptions = {}): string {
  if (!html || typeof html !== "string") return "";

  const { allowedAttributes = ALLOWED_ATTR, allowedTags = ALLOWED_TAGS } =
    options;

  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
  });
}
