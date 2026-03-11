<!--
  SearchEditor is ProseMirror-based search field for constructing Lucene queries.

  It supports autofilling field names and values with static and dynamic suggestions.

  The PM document is the source of truth for the query.
  Serialization to a Lucene string happens only on submit.
  Deserialization from a Lucene string happens when the initialQuery prop changes.

  SearchEditor was written by Allan Lasser with assistance from Claude Opus 4.6.
-->
<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { EditorState, Plugin } from "prosemirror-state";
  import type { Node } from "prosemirror-model";
  import { EditorView } from "prosemirror-view";
  import { keymap } from "prosemirror-keymap";
  import { baseKeymap } from "prosemirror-commands";
  import { history, undo, redo } from "prosemirror-history";
  import { searchSchema } from "./schema";
  import { serialize } from "./pm-serialize";
  import { deserialize } from "./pm-deserialize";
  import { decorationPlugin } from "./decoration-plugin";
  import { clipboardPlugin } from "./clipboard-plugin";
  import { atomNavigationKeymap } from "./atom-navigation-plugin";
  import { nodeViews } from "./nodeviews";
  import { autocompletePlugin } from "./plugins/autocomplete";
  import "./plugins/autocomplete.css";
  import {
    isAsyncField,
    fetchDisplayNames,
    type Suggestion,
  } from "./autocomplete-data";
  import { validateQuery } from "./parse";

  import { Search16, Stop16 } from "svelte-octicons";
  import Button from "$lib/components/common/Button.svelte";
  import FieldValueChip from "$lib/components/documents/search/FieldValueChip.svelte";

  const dispatch = createEventDispatcher();

  export let initialQuery = "";
  /** Locked chips displayed before the editor as search context (e.g. project scope). */
  export let contextChips: Array<{
    field: string;
    label: string;
  }> = [];

  /**
   * Preloaded suggestions derived from current search results.
   * Keyed by canonical field name (e.g. "user", "organization").
   * Used as default suggestions when the autocomplete filter is empty,
   * avoiding an API call and showing contextually relevant values.
   */
  export let preloadedSuggestions: Record<string, Suggestion[]> = {};

  let editorRef: HTMLDivElement;
  let view: EditorView;

  /** Whether the current query is valid Lucene syntax. */
  let queryValid = true;

  /** Last query emitted via the change event, to avoid redundant dispatches. */
  let lastEmittedQuery = initialQuery;

  // When the initialQuery prop changes externally (e.g. route navigation),
  // update the editor contents to match — but NOT while the user is actively
  // typing (editor has focus), to avoid disrupting their input.
  let lastInitialQuery = initialQuery;
  $: if (view && initialQuery !== lastInitialQuery) {
    lastInitialQuery = initialQuery;
    if (!view.hasFocus()) {
      updateQuery(initialQuery);
    }
  }

  /** Tiny plugin that toggles an `is-empty` class on the editor DOM. */
  function placeholderPlugin() {
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
  function getFingerprint(doc: Node): string {
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

  /** Upon submission, serialize the current PM document to a Lucene query string. */
  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!queryValid) return;
    const query = view ? serialize(view.state.doc) : initialQuery;
    dispatch("submit", { "q": query });
  }

  onMount(() => {
    const state = EditorState.create({
      schema: searchSchema,
      doc: deserialize(initialQuery),
      plugins: [
        history(),
        autocompletePlugin({
          getPreloadedSuggestions: () => preloadedSuggestions,
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

    view = new EditorView(editorRef, {
      state,
      nodeViews,
      attributes: {spellcheck: "false"},
      dispatchTransaction(tr) {
        const oldDoc = view.state.doc;
        view.updateState(view.state.apply(tr));
        if (tr.docChanged) {
          const q = serialize(view.state.doc);
          queryValid = validateQuery(q).isValid;
          if (q !== lastEmittedQuery) {
            lastEmittedQuery = q;
            // Only emit change for structural changes (chip insert/remove).
            // Plain text typing should not trigger searches — the user must
            // explicitly submit the form for text-only queries.
            const structural =
              getFingerprint(oldDoc) !== getFingerprint(view.state.doc);
            if (structural) {
              dispatch("change", { q, structural });
            }
          }
        }
      },
    });
    enrichChips(view);
  });

  onDestroy(() => {
    if (view) {
      view.destroy();
    }
  });

  /**
   * Walk the doc for entity field-value chips lacking displayValue,
   * fetch display names from the API, then update the chips in-place.
   */
  async function enrichChips(v: EditorView) {
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

  /**
   * Collect a map of "field:value" → displayValue from existing chips
   * so we can carry forward resolved names when rebuilding the doc.
   */
  function collectDisplayValues(
    doc: import("prosemirror-model").Node,
  ): Map<string, string> {
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
  function applyCarriedDisplayValues(
    state: import("prosemirror-state").EditorState,
    carried: Map<string, string>,
  ): import("prosemirror-state").Transaction | null {
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

  /** Public: update the editor with a new query string. */
  export function updateQuery(query: string) {
    if (!view) return;

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

  /** Get the current serialized query. Used by tests. */
  export function getQuery(): string {
    if (!view) return initialQuery;
    return serialize(view.state.doc);
  }

  /** Get the EditorView instance for programmatic node insertion. Used by tests. */
  export function getView(): EditorView {
    return view;
  }
</script>

<form class="search-editor-container" on:submit={handleSubmit}>
  <div class="search-editor-status" class:invalid={!queryValid}>
    {#if queryValid}
      <Search16 />
    {:else}
      <Stop16 />
    {/if}
  </div>
  {#each contextChips as chip}
    <FieldValueChip field={chip.field} value={chip.label} locked />
  {/each}
  <div bind:this={editorRef} class="prosemirror-editor" role="textbox"></div>
  <Button type="submit" mode="primary" ghost minW={false} disabled={!queryValid}>Search</Button>
</form>

<style>
  .search-editor-container {
    flex: 1 1 auto;
    min-width: 16rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: white;
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 0 0 0.75rem;

    caret-color: var(--blue-3, #0969da);
  }

  .search-editor-status {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  .search-editor-status.invalid {
    fill: var(--red-3);
  }

  .prosemirror-editor {
    flex: 1 1 auto;
    padding: 0.375rem 0.75rem;
  }

  :global(.ProseMirror) {
    outline: none;
  }

  :global(.ProseMirror p) {
    margin: 0;
  }

  /* Placeholder when editor is empty */
  :global(.ProseMirror.is-empty p:first-child::before) {
    content: "Search documents\2026   \2318/ for fields";
    color: var(--gray-4, #8b949e);
    pointer-events: none;
    float: left;
    height: 0;
  }

  /* Decoration styles for operators, parens, and prefixes */
  :global(.search-operator) {
    font-family: var(--font-mono);
    background-color: var(--purple-1);
    border-radius: 3px;
    padding: 0 2px;
    font-weight: 600;
  }

  :global(.search-paren) {
    background-color: var(--gray-1);
    border-radius: 2px;
    padding: 0 1px;
    font-weight: 600;
  }

  :global(.search-prefix-required) {
    color: var(--green-3);
    font-weight: 600;
  }

  :global(.search-prefix-excluded) {
    color: var(--orange-3);
    font-weight: 600;
  }

  /* Chip styles (used by atom nodes) */
  :global(.search-chip) {
    display: inline;
    border-radius: .25rem;
    padding: 0 4px;
    margin: 0 2px;
    white-space: nowrap;
  }

  /* Selected chip — ProseMirror adds this class when an atom node is selected */
  :global(.ProseMirror-selectednode .search-chip) {
    outline: 1px solid var(--blue-3);
    border-radius: .25rem;
  }

  /* Wavy underline for syntax errors */
  :global(.search-syntax-error) {
    text-decoration-line: underline;
    text-decoration-style: wavy;
    text-decoration-color: var(--red-3);
  }
</style>
