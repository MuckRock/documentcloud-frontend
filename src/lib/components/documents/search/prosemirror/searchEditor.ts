/**
 * Framework-agnostic ProseMirror search editor logic.
 *
 * This module encapsulates the editor state creation, plugin wiring,
 * atom enrichment, and document update helpers so the Svelte component
 * only needs to handle lifecycle and event dispatching.
 */
import type { Node } from "prosemirror-model";
import type { Transaction } from "prosemirror-state";

import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { history, undo, redo } from "prosemirror-history";
import { searchSchema, ATOM_TYPES } from "./schema";
import { nodeViews } from "./nodeviews.svelte";
import { decorationPlugin } from "./plugins/decoration-plugin";
import { clipboardPlugin } from "./plugins/clipboard-plugin";
import { atomNavigationKeymap } from "./plugins/atom-navigation-plugin";
import { autocompletePlugin } from "./plugins/autocomplete.svelte";
import {
  isAsyncField,
  fetchDisplayNames,
  type Suggestion,
} from "./plugins/autocomplete-data";
import { deserialize } from "../utils/deserialize";
import { serialize } from "../utils/serialize";
import { validateQuery } from "../utils/parse";
import { decorationPluginKey } from "./plugins/decoration-plugin";

// --- Pure helpers ---

/** Tiny plugin that toggles an `is-empty` class on the editor DOM. */
function placeholderPlugin(): Plugin {
  return new Plugin({
    view(editorView) {
      function update() {
        const doc = editorView.state.doc;
        const para = doc.firstChild;
        const isEmpty =
          doc.childCount === 1 && para !== null && para.content.size === 0;
        editorView.dom.classList.toggle("is-empty", isEmpty);
      }
      update();
      return { update };
    },
  });
}

/** Collect a fingerprint of all atom nodes in a document.
 *  Only includes attributes that affect the serialized query —
 *  cosmetic attrs like displayValue are excluded. */
export function getFingerprint(doc: Node): string {
  const parts: string[] = [];
  // PM tree walker: visits every node in the doc depth-first, calling back with (node, pos)
  doc.descendants((node) => {
    if (ATOM_TYPES.has(node.type.name)) {
      // Exclude displayValue — it's cosmetic and doesn't affect the query
      const { displayValue, ...queryAttrs } = node.attrs;
      parts.push(`${node.type.name}:${JSON.stringify(queryAttrs)}`);
    }
  });
  return parts.join("|");
}

/**
 * Collect a map of "field:value" → displayValue from existing atoms
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
 * Apply carried-forward display values to a new doc's atoms.
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
        // setNodeMarkup updates a node's attributes in place without replacing the node
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
 * Walk the doc for entity field-value atoms lacking displayValue,
 * fetch display names from the API, then update the atoms in-place.
 */
export async function enrichAtoms(v: EditorView): Promise<void> {
  try {
    // Collect atoms that need enrichment
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
  query: string;
  getPreloadedSuggestions: () => Record<string, Suggestion[]>;
  /** Called when the document changes. `structural` is true when atoms were added/removed. */
  onDocChange: (query: string, structural: boolean) => void;
}

/** Create and mount a ProseMirror search editor into the given DOM element. */
export function createSearchEditor(
  target: HTMLElement,
  opts: SearchEditorOptions,
): EditorView {
  // EditorState = immutable snapshot of the doc, selection, and plugin states.
  // PM never mutates state — every change produces a new state via transactions.
  const state = EditorState.create({
    schema: searchSchema,
    doc: deserialize(opts.query),
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

  // EditorView renders the state into a contenteditable DOM element and handles user input.
  const view = new EditorView(target, {
    state,
    nodeViews,
    attributes: { spellcheck: "false" },
    // Called on every user action. PM never mutates state directly —
    // each change is a Transaction that produces a new immutable state.
    dispatchTransaction(tr) {
      const oldDoc = view.state.doc;
      // Apply the transaction to get a new state, then tell the view to render it.
      view.updateState(view.state.apply(tr));
      if (tr.docChanged) {
        const q = serialize(view.state.doc);
        const structural =
          getFingerprint(oldDoc) !== getFingerprint(view.state.doc);
        opts.onDocChange(q, structural);
        // Enrich any newly added atoms (e.g. from paste) that need display names
        if (structural) {
          enrichAtoms(view);
        }
      }
    },
  });

  enrichAtoms(view);
  return view;
}

// --- View helpers ---

/** Update the editor with a new query string, preserving display values where possible. */
export function updateEditorQuery(view: EditorView, query: string): void {
  // Skip if the editor already represents this query
  const current = serialize(view.state.doc);
  if (current === query) return;

  // Carry forward display values from atoms that still exist in the new query
  const carried = collectDisplayValues(view.state.doc);

  const doc = deserialize(query);
  // Replace the entire document content with the newly deserialized doc
  const tr = view.state.tr.replaceWith(
    0,
    view.state.doc.content.size,
    doc.content,
  );
  view.dispatch(tr);

  // Restore display values for atoms that survived the update
  const carryTr = applyCarriedDisplayValues(view.state, carried);
  if (carryTr) {
    view.dispatch(carryTr);
  }

  // Enrich any remaining atoms that still need display names
  enrichAtoms(view);
}

/** Get the current serialized query from the editor. */
export function getEditorQuery(view: EditorView): string {
  return serialize(view.state.doc);
}

/**
 * Validate the current query. If invalid, enter error mode in the
 * decoration plugin (shows wavy underlines until the query is fixed).
 * Returns true if the query is valid.
 */
export function validateEditorQuery(view: EditorView): boolean {
  const q = serialize(view.state.doc);
  const { isValid } = validateQuery(q);
  if (!isValid) {
    // setMeta attaches metadata to a transaction — plugins read this to update their own state
    const tr = view.state.tr.setMeta(decorationPluginKey, true);
    view.dispatch(tr);
  }
  return isValid;
}

/** Check whether the decoration plugin is currently in error mode. */
export function isEditorInErrorMode(view: EditorView): boolean {
  return decorationPluginKey.getState(view.state)?.showErrors ?? false;
}
