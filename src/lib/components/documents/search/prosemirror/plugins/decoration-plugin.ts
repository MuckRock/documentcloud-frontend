import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import type { Node as ProseMirrorNode } from "prosemirror-model";
import {
  serialize,
  serializeWithOffsets,
  type TextOffsetSegment,
} from "../../utils/serialize";
import { validateQuery } from "../../utils/parse";

/**
 * Decoration plugin for the search editor.
 *
 * Scans text content after each transaction and applies inline decorations
 * for boolean operators (AND, OR, NOT), parentheses, and prefix operators (+, -).
 * Error decorations (wavy underlines) are only shown after a submit attempt fails
 * validation. Once in error mode, the plugin re-validates on each edit and keeps
 * showing errors until the query becomes valid.
 * Decorations are ephemeral — they don't affect the document model or serialization.
 */

export const decorationPluginKey = new PluginKey<DecorationPluginState>(
  "search-decorations",
);

interface DecorationPluginState {
  decorations: DecorationSet;
  /** Whether we're in error mode (triggered by a failed submit). */
  showErrors: boolean;
}

// Match AND, OR, NOT as whole words (word boundary on both sides)
const OPERATOR_RE = /\b(AND|OR|NOT)\b/g;

// Match ( and ) characters
const PAREN_RE = /[()]/g;

// Match + or - at the start of a term:
// Must be at start of text or after whitespace, followed by a non-space character
const PREFIX_RE = /(?:^|(?<=\s))[+\-](?=\S)/g;

// Match a prefix operator and the full term that follows it (for background highlighting)
// Handles both unquoted terms (+term) and quoted terms (+"multi word")
const PREFIX_TERM_RE = /(?:^|(?<=\s))[+\-](?:"[^"]*"?|\S+)/g;

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

function buildDecorations(
  doc: ProseMirrorNode,
  includeErrors: boolean,
): DecorationSet {
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
        // Decorations are visual overlays — they add CSS classes without changing the document model
        Decoration.inline(from, to, { class: "search-operator" }),
      );
    }

    // Parentheses
    PAREN_RE.lastIndex = 0;
    while ((match = PAREN_RE.exec(text)) !== null) {
      const from = pos + match.index;
      const to = from + 1;
      decorations.push(Decoration.inline(from, to, { class: "search-paren" }));
    }

    // Prefix operators (+ and -)
    PREFIX_RE.lastIndex = 0;
    while ((match = PREFIX_RE.exec(text)) !== null) {
      const from = pos + match.index;
      const to = from + 1;
      const cls =
        match[0] === "+" ? "search-prefix-required" : "search-prefix-excluded";
      decorations.push(Decoration.inline(from, to, { class: cls }));
    }

    // Background highlight for the full prefixed term (prefix + term)
    PREFIX_TERM_RE.lastIndex = 0;
    while ((match = PREFIX_TERM_RE.exec(text)) !== null) {
      const from = pos + match.index;
      const to = from + match[0].length;
      const cls = match[0].startsWith("+")
        ? "search-term-required"
        : "search-term-excluded";
      decorations.push(Decoration.inline(from, to, { class: cls }));
    }
  });

  // Error decorations for invalid syntax (only when in error mode)
  if (includeErrors) {
    const { text: query, offsets } = serializeWithOffsets(doc);
    const validation = validateQuery(query);
    if (!validation.isValid) {
      const region = findErrorRegion(query, validation.error);
      if (region) {
        const errorDecos = mapErrorToDecorations(
          offsets,
          region.from,
          region.to,
        );
        decorations.push(...errorDecos);
      }
    }
  }

  // DecorationSet must be created against a specific doc version so PM can map positions correctly
  return DecorationSet.create(doc, decorations);
}

/**
 * Map an error region (from/to offsets in the serialized string) to
 * ProseMirror inline decorations using the offset map from serializeWithOffsets().
 */
function mapErrorToDecorations(
  offsets: TextOffsetSegment[],
  errorFrom: number,
  errorTo: number,
): Decoration[] {
  const decorations: Decoration[] = [];

  for (const seg of offsets) {
    const overlapStart = Math.max(seg.strFrom, errorFrom);
    const overlapEnd = Math.min(seg.strTo, errorTo);

    if (overlapStart < overlapEnd) {
      const pmFrom = seg.pmPos + (overlapStart - seg.strFrom);
      const pmTo = seg.pmPos + (overlapEnd - seg.strFrom);
      decorations.push(
        Decoration.inline(pmFrom, pmTo, { class: "search-syntax-error" }),
      );
    }
  }

  return decorations;
}

export function decorationPlugin() {
  return new Plugin<DecorationPluginState>({
    key: decorationPluginKey,
    state: {
      init(_, { doc }) {
        return {
          decorations: buildDecorations(doc, false),
          showErrors: false,
        };
      },
      // Runs on every transaction — rebuild decorations if the doc changed
      apply(tr, pluginState) {
        // Check if this transaction triggers error mode
        const triggerErrors = tr.getMeta(decorationPluginKey);
        if (triggerErrors === true) {
          return {
            decorations: buildDecorations(tr.doc, true),
            showErrors: true,
          };
        }

        if (tr.docChanged) {
          if (pluginState.showErrors) {
            // In error mode: re-validate and exit error mode if now valid
            const query = serialize(tr.doc);
            const isValid = validateQuery(query).isValid;
            return {
              decorations: buildDecorations(tr.doc, !isValid),
              showErrors: !isValid,
            };
          }
          return {
            decorations: buildDecorations(tr.doc, false),
            showErrors: false,
          };
        }
        return pluginState;
      },
    },
    props: {
      // PM queries each plugin for decorations to render via this prop
      decorations(state) {
        return this.getState(state)?.decorations ?? DecorationSet.empty;
      },
    },
  });
}
