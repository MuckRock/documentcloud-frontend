/**
 * Framework-agnostic ProseMirror search editor logic.
 *
 * This module encapsulates the editor state creation, plugin wiring,
 * chip enrichment, and document update helpers so the Svelte component
 * only needs to handle lifecycle and event dispatching.
 */

import { EditorState, Plugin } from "prosemirror-state";
import type { Transaction } from "prosemirror-state";
import type { Node } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { history, undo, redo } from "prosemirror-history";
import { searchSchema } from "./schema";
import { nodeViews } from "./nodeviews";
import { decorationPlugin } from "./plugins/decoration-plugin";
import { clipboardPlugin } from "./plugins/clipboard-plugin";
import { atomNavigationKeymap } from "./plugins/atom-navigation-plugin";
import { autocompletePlugin } from "./plugins/autocomplete";
import {
  isAsyncField,
  fetchDisplayNames,
  type Suggestion,
} from "./plugins/autocomplete-data";
import { deserialize } from "../utils/deserialize";
import { serialize } from "../utils/serialize";
import { validateQuery } from "../utils/parse";

// --- Pure helpers ---

/** Tiny plugin that toggles an `is-empty` class on the editor DOM. */
function placeholderPlugin(): Plugin {
  return new Plugin({
    view(editorView) {
      function update() {
        const doc = editorView.state.doc;
        const para = doc.firstChild;
        const isEmpty =
          doc.childCount === 1 &&
          para !== null &&
          para.content.size === 0;
        editorView.dom.classList.toggle("is-empty", isEmpty);
      }
      update();
      return { update };
    },
  });
}

const CHIP_TYPES = new Set(["field-value", "range", "sort"]);

/** Collect a fingerprint of all chip nodes in a document.
 *  Only includes attributes that affect the serialized query —
 *  cosmetic attrs like displayValue are excluded. */
export function getFingerprint(doc: Node): string {
  const parts: string[] = [];
  doc.descendants((node) => {
    if (CHIP_TYPES.has(node.type.name)) {
      // Exclude displayValue — it's cosmetic and doesn't affect the query
      const { displayValue, ...queryAttrs } = node.attrs;
      parts.push(`${node.type.name}:${JSON.stringify(queryAttrs)}`);
    }
  });
  return parts.join("|");
}

/**
 * Collect a map of "field:value" → displayValue from existing chips
 * so we can carry forward resolved names when rebuilding the doc.
 */
export function collectDisplayValues(doc: Node): Map<string, string> {
  const map = new Map<string, string>();
  doc.descendants((node) => {
    if (
      node.type.name === "field-value" &&
      node.attrs.displayValue &&
      isAsyncField(node.attrs.field)
    ) {
      map.set(
        `${node.attrs.field}:${node.attrs.value}`,
        node.attrs.displayValue,
      );
    }
  });
  return map;
}

/**
 * Apply carried-forward display values to a new doc's chips.
 * Returns a transaction if any updates were made, or null.
 */
export function applyCarriedDisplayValues(
  state: EditorState,
  carried: Map<string, string>,
): Transaction | null {
  if (carried.size === 0) return null;
  const tr = state.tr;
  let changed = false;
  state.doc.descendants((node, pos) => {
    if (
      node.type.name === "field-value" &&
      !node.attrs.displayValue &&
      isAsyncField(node.attrs.field)
    ) {
      const key = `${node.attrs.field}:${node.attrs.value}`;
      const displayValue = carried.get(key);
      if (displayValue) {
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          displayValue,
        });
        changed = true;
      }
    }
  });
  return changed ? tr : null;
}

/**
 * Walk the doc for entity field-value chips lacking displayValue,
 * fetch display names from the API, then update the chips in-place.
 */
export async function enrichChips(v: EditorView): Promise<void> {
  try {
    // Collect chips that need enrichment
    const toEnrich: Array<{ field: string; value: string }> = [];
    v.state.doc.descendants((node) => {
      if (
        node.type.name === "field-value" &&
        !node.attrs.displayValue &&
        isAsyncField(node.attrs.field)
      ) {
        toEnrich.push({ field: node.attrs.field, value: node.attrs.value });
      }
    });

    if (toEnrich.length === 0) return;

    const names = await fetchDisplayNames(toEnrich);
    if (names.size === 0) return;

    // Walk the current doc (may have changed) and apply updates
    const tr = v.state.tr;
    let changed = false;
    v.state.doc.descendants((node, pos) => {
      if (node.type.name === "field-value" && !node.attrs.displayValue) {
        const key = `${node.attrs.field}:${node.attrs.value}`;
        const displayValue = names.get(key);
        if (displayValue) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            displayValue,
          });
          changed = true;
        }
      }
    });

    if (changed) {
      v.dispatch(tr);
    }
  } catch {
    // Enrichment is best-effort; silently ignore API failures
  }
}

// --- Editor factory ---

export interface SearchEditorOptions {
  initialQuery: string;
  getPreloadedSuggestions: () => Record<string, Suggestion[]>;
  /** Called when the document changes. `structural` is true when chips were added/removed. */
  onDocChange: (query: string, structural: boolean, valid: boolean) => void;
}

/** Create and mount a ProseMirror search editor into the given DOM element. */
export function createSearchEditor(
  target: HTMLElement,
  opts: SearchEditorOptions,
): EditorView {
  const state = EditorState.create({
    schema: searchSchema,
    doc: deserialize(opts.initialQuery),
    plugins: [
      history(),
      autocompletePlugin({
        getPreloadedSuggestions: opts.getPreloadedSuggestions,
      }),
      keymap({
        "Mod-z": undo,
        "Mod-y": redo,
        "Mod-Shift-z": redo,
        // Submit the form on Enter (when autocomplete isn't active).
        // Autocomplete's handleKeyDown runs first and intercepts Enter when open.
        Enter: (_state, _dispatch, view) => {
          if (view) {
            const form = view.dom.closest("form");
            if (form) form.requestSubmit();
          }
          return true;
        },
      }),
      atomNavigationKeymap(),
      keymap(baseKeymap),
      decorationPlugin(),
      clipboardPlugin(),
      placeholderPlugin(),
    ],
  });

  const view = new EditorView(target, {
    state,
    nodeViews,
    attributes: { spellcheck: "false" },
    dispatchTransaction(tr) {
      const oldDoc = view.state.doc;
      view.updateState(view.state.apply(tr));
      if (tr.docChanged) {
        const q = serialize(view.state.doc);
        const valid = validateQuery(q).isValid;
        const structural =
          getFingerprint(oldDoc) !== getFingerprint(view.state.doc);
        opts.onDocChange(q, structural, valid);
      }
    },
  });

  enrichChips(view);
  return view;
}

// --- View helpers ---

/** Update the editor with a new query string, preserving display values where possible. */
export function updateEditorQuery(view: EditorView, query: string): void {
  // Skip if the editor already represents this query
  const current = serialize(view.state.doc);
  if (current === query) return;

  // Carry forward display values from chips that still exist in the new query
  const carried = collectDisplayValues(view.state.doc);

  const doc = deserialize(query);
  const tr = view.state.tr.replaceWith(
    0,
    view.state.doc.content.size,
    doc.content,
  );
  view.dispatch(tr);

  // Restore display values for chips that survived the update
  const carryTr = applyCarriedDisplayValues(view.state, carried);
  if (carryTr) {
    view.dispatch(carryTr);
  }

  // Enrich any remaining chips that still need display names
  enrichChips(view);
}

/** Get the current serialized query from the editor. */
export function getEditorQuery(view: EditorView): string {
  return serialize(view.state.doc);
}
