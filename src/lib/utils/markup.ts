import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import sanitizeHtml from "sanitize-html";

import { ALLOWED_ATTR, ALLOWED_TAGS } from "@/config/config.js";

marked.use(gfmHeadingId());

export function renderMarkdown(content: string) {
  return clean(marked.parse(content));
}

export function clean(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
  });
}
