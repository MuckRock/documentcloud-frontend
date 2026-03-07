import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import type { Node as ProseMirrorNode } from "prosemirror-model";

/**
 * Decoration plugin for the search editor.
 *
 * Scans text content after each transaction and applies inline decorations
 * for boolean operators (AND, OR, NOT), parentheses, and prefix operators (+, -).
 * Decorations are ephemeral — they don't affect the document model or serialization.
 */

// Match AND, OR, NOT as whole words (word boundary on both sides)
const OPERATOR_RE = /\b(AND|OR|NOT)\b/g;

// Match ( and ) characters
const PAREN_RE = /[()]/g;

// Match + or - at the start of a term:
// Must be at start of text or after whitespace, followed by a non-space character
const PREFIX_RE = /(?:^|(?<=\s))[+\-](?=\S)/g;

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

  return DecorationSet.create(doc, decorations);
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
