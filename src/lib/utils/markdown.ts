import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import DOMPurify from "isomorphic-dompurify";

marked.use(gfmHeadingId());
marked.use({ async: false });

export function renderMarkdown(content: string) {
  return DOMPurify.sanitize(marked.parse(content) as string);
}
