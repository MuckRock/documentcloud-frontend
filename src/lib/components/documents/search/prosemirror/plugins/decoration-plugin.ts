import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import type { Node as ProseMirrorNode } from "prosemirror-model";
import { serialize } from "../../utils/serialize";
import { validateQuery } from "../../utils/parse";

/**
 * Decoration plugin for the search editor.
 *
 * Scans text content after each transaction and applies inline decorations
 * for boolean operators (AND, OR, NOT), parentheses, and prefix operators (+, -).
 * Also applies wavy underline error decorations when the query has invalid syntax.
 * Decorations are ephemeral — they don't affect the document model or serialization.
 */

// Match AND, OR, NOT as whole words (word boundary on both sides)
const OPERATOR_RE = /\b(AND|OR|NOT)\b/g;

// Match ( and ) characters
const PAREN_RE = /[()]/g;

// Match + or - at the start of a term:
// Must be at start of text or after whitespace, followed by a non-space character
const PREFIX_RE = /(?:^|(?<=\s))[+\-](?=\S)/g;

/**
 * Given the validation error message, find the error region as
 * { from, to } offsets in the serialized query string.
 */
function findErrorRegion(
  query: string,
  error: string,
): { from: number; to: number } | null {
  if (!query.length) return null;

  // Empty quotes: underline just the ""
  if (error === "Empty quotes are not allowed in queries") {
    const idx = query.indexOf('""');
    if (idx >= 0) return { from: idx, to: idx + 2 };
  }

  // Unbalanced quotes: find the unmatched " and underline from there to end
  if (error === "Unbalanced quotes in query") {
    let unmatchedIdx = -1;
    let inQuote = false;
    for (let i = 0; i < query.length; i++) {
      if (query[i] === '"' && (i === 0 || query[i - 1] !== "\\")) {
        if (!inQuote) {
          unmatchedIdx = i;
          inQuote = true;
        } else {
          inQuote = false;
        }
      }
    }
    if (unmatchedIdx >= 0) return { from: unmatchedIdx, to: query.length };
  }

  // Incomplete range: find [ without matching ]
  if (error === "Incomplete range query: missing closing bracket") {
    const idx = query.lastIndexOf("[");
    if (idx >= 0) return { from: idx, to: query.length };
  }

  // Fallback: underline entire content
  return { from: 0, to: query.length };
}

/**
 * Compute the serialized length of an atom node.
 * Must match the logic in serialize.ts exactly.
 */
function serializeAtomLength(node: ProseMirrorNode): number {
  switch (node.type.name) {
    case "field-value": {
      const { field, value, prefix, boost, quoted } = node.attrs;
      let len = 0;
      if (prefix) len += (prefix as string).length;
      len += (field as string).length + 1; // field + ":"
      if (quoted) len += 1;
      len += (value as string).length;
      if (quoted) len += 1;
      if (boost) len += 1 + String(boost).length; // ^boost
      return len;
    }
    case "range": {
      const { field, lower, upper, prefix } = node.attrs;
      let len = 0;
      if (prefix) len += (prefix as string).length;
      len += (field as string).length + 1; // field + ":"
      len += 1; // [ or {
      len += (lower as string).length;
      len += 4; // " TO "
      len += (upper as string).length;
      len += 1; // ] or }
      return len;
    }
    case "sort": {
      const { field, direction } = node.attrs;
      let len = 5; // "sort:"
      if (direction === "desc") len += 1; // "-"
      len += (field as string).length;
      return len;
    }
    default:
      return 0;
  }
}

const ATOM_TYPES = new Set(["field-value", "range", "sort"]);

function buildDecorations(doc: ProseMirrorNode): DecorationSet {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;

    const text = node.text;

    // Boolean operators
    let match: RegExpExecArray | null;
    OPERATOR_RE.lastIndex = 0;
    while ((match = OPERATOR_RE.exec(text)) !== null) {
      const from = pos + match.index;
      const to = from + match[0].length;
      decorations.push(
        Decoration.inline(from, to, { class: "search-operator" }),
      );
    }

    // Parentheses
    PAREN_RE.lastIndex = 0;
    while ((match = PAREN_RE.exec(text)) !== null) {
      const from = pos + match.index;
      const to = from + 1;
      decorations.push(
        Decoration.inline(from, to, { class: "search-paren" }),
      );
    }

    // Prefix operators (+ and -)
    PREFIX_RE.lastIndex = 0;
    while ((match = PREFIX_RE.exec(text)) !== null) {
      const from = pos + match.index;
      const to = from + 1;
      const cls =
        match[0] === "+"
          ? "search-prefix-required"
          : "search-prefix-excluded";
      decorations.push(Decoration.inline(from, to, { class: cls }));
    }
  });

  // Error decorations for invalid syntax
  const query = serialize(doc);
  const validation = validateQuery(query);
  if (!validation.isValid) {
    const region = findErrorRegion(query, validation.error);
    if (region) {
      const errorDecos = mapErrorToDecorations(doc, region.from, region.to);
      decorations.push(...errorDecos);
    }
  }

  return DecorationSet.create(doc, decorations);
}

/**
 * Map an error region (from/to offsets in the serialized string) to
 * ProseMirror inline decorations. Walks the doc in serialize order,
 * tracking string offset, and creates decorations for text node regions
 * that overlap with the error region.
 */
function mapErrorToDecorations(
  doc: ProseMirrorNode,
  errorFrom: number,
  errorTo: number,
): Decoration[] {
  const decorations: Decoration[] = [];
  let strOffset = 0;
  let lastWasAtom = false;
  // Tracks whether the serialized string so far ends with a space,
  // mirroring serialize()'s `result.endsWith(" ")` check.
  let resultEndsWithSpace = false;

  const paragraph = doc.firstChild;
  if (!paragraph) return decorations;

  paragraph.forEach((node, offset) => {
    const pmPos = offset + 1; // +1 for paragraph open tag

    if (node.isText && node.text) {
      const text = node.text.replace(/\u00A0/g, " ");

      // Synthetic space: serialize() does `if (lastWasAtom && text.length > 0 && !text.startsWith(" "))`
      if (lastWasAtom && text.length > 0 && !text.startsWith(" ")) {
        strOffset += 1;
      }

      const textStrStart = strOffset;
      const textStrEnd = strOffset + text.length;

      // Check overlap between [textStrStart, textStrEnd) and [errorFrom, errorTo)
      const overlapStart = Math.max(textStrStart, errorFrom);
      const overlapEnd = Math.min(textStrEnd, errorTo);

      if (overlapStart < overlapEnd) {
        const pmFrom = pmPos + (overlapStart - textStrStart);
        const pmTo = pmPos + (overlapEnd - textStrStart);
        decorations.push(
          Decoration.inline(pmFrom, pmTo, { class: "search-syntax-error" }),
        );
      }

      strOffset = textStrEnd;
      lastWasAtom = false;
      resultEndsWithSpace = text.endsWith(" ");
      return;
    }

    if (ATOM_TYPES.has(node.type.name)) {
      // Synthetic space: serialize() does `if (isAtom && result.length > 0 && !result.endsWith(" "))`
      if (strOffset > 0 && !resultEndsWithSpace) {
        strOffset += 1;
      }

      strOffset += serializeAtomLength(node);
      lastWasAtom = true;
      resultEndsWithSpace = false; // atom serialization never ends with space
    }
  });

  return decorations;
}

export function decorationPlugin() {
  return new Plugin({
    state: {
      init(_, { doc }) {
        return buildDecorations(doc);
      },
      apply(tr, decorations) {
        if (tr.docChanged) {
          return buildDecorations(tr.doc);
        }
        return decorations;
      },
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
    },
  });
}
