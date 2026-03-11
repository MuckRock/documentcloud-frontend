<!--
  SearchEditor: A ProseMirror-based search field for constructing Lucene queries.

  The PM document is the source of truth for the query. Serialization to a Lucene
  string happens only on submit. No continuous parse/rebuild loop.
-->
<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import {
    EditorState,
    Plugin,
    NodeSelection,
    TextSelection,
    type Command,
  } from "prosemirror-state";
  import { EditorView } from "prosemirror-view";
  import { keymap } from "prosemirror-keymap";
  import { baseKeymap } from "prosemirror-commands";
  import { history, undo, redo } from "prosemirror-history";
  import { Search16, Stop16 } from "svelte-octicons";
  import Button from "../../common/Button.svelte";
  import { searchSchema } from "./schema";
  import { serialize } from "./pm-serialize";
  import { deserialize } from "./pm-deserialize";
  import { decorationPlugin } from "./decoration-plugin";
  import { clipboardPlugin } from "./clipboard-plugin";
  import { autocompletePlugin } from "./plugins/autocomplete";
  import "./plugins/autocomplete.css";
  import { nodeViews } from "./nodeviews";
  import {
    isAsyncField,
    fetchDisplayNames,
    type Suggestion,
  } from "./autocomplete-data";
  import { validateQuery } from "./parse";

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

  /** Create a PM document from a Lucene query string.
   *  Deserializes structured syntax (field:value, ranges, sort) into
   *  atom nodes rendered as chips. Plain text passes through unchanged.
   */
  function createDoc(query: string) {
    return deserialize(query);
  }

  const CHIP_TYPES = new Set(["field-value", "range", "sort"]);

  /** Collect a fingerprint of all chip nodes in a document.
   *  Only includes attributes that affect the serialized query —
   *  cosmetic attrs like displayValue are excluded. */
  function atomFingerprint(doc: import("prosemirror-model").Node): string {
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

  /** Serialize the current PM document to a Lucene query string. */
  function getQuery(): string {
    if (!view) return initialQuery;
    return serialize(view.state.doc);
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!queryValid) return;
    const query = getQuery();
    dispatch("submit", { "q": query });
  }

  /**
   * Arrow-left: if the cursor is in a TextSelection and the node
   * immediately before it is an atom, select that atom node instead
   * of jumping over it.
   */
  const ATOM_TYPES = new Set(["field-value", "range", "sort"]);

  /**
   * Arrow-left: if the cursor (empty TextSelection) is immediately
   * after a chip node, select it instead of jumping over it.
   */
  const arrowLeftIntoAtom: Command = (state, dispatch) => {
    const { selection } = state;
    if (!(selection instanceof TextSelection) || !selection.empty) return false;
    const { $from } = selection;
    const before = $from.nodeBefore;
    if (!before || !ATOM_TYPES.has(before.type.name)) return false;
    if (dispatch) {
      dispatch(
        state.tr.setSelection(
          NodeSelection.create(state.doc, $from.pos - before.nodeSize),
        ),
      );
    }
    return true;
  };

  /**
   * Arrow-right: if the cursor (empty TextSelection) is immediately
   * before a chip node, select it instead of jumping over it.
   */
  const arrowRightIntoAtom: Command = (state, dispatch) => {
    const { selection } = state;
    if (!(selection instanceof TextSelection) || !selection.empty) return false;
    const { $from } = selection;
    const after = $from.nodeAfter;
    if (!after || !ATOM_TYPES.has(after.type.name)) return false;
    if (dispatch) {
      dispatch(
        state.tr.setSelection(NodeSelection.create(state.doc, $from.pos)),
      );
    }
    return true;
  };

  /**
   * Arrow-down: if a chip with a popover is selected, move focus
   * into the chip editor popover.
   */
  const arrowDownIntoPopover: Command = (state) => {
    if (!(state.selection instanceof NodeSelection)) return false;
    const node = state.selection.node;
    if (!ATOM_TYPES.has(node.type.name) || node.type.name === "sort")
      return false;
    const popover = document.querySelector(".chip-editor") as HTMLElement;
    if (!popover) return false;
    popover.focus();
    return true;
  };

  onMount(() => {
    const state = EditorState.create({
      schema: searchSchema,
      doc: createDoc(initialQuery),
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
        keymap({
          ArrowLeft: arrowLeftIntoAtom,
          ArrowRight: arrowRightIntoAtom,
          ArrowDown: arrowDownIntoPopover,
        }),
        keymap(baseKeymap),
        decorationPlugin(),
        clipboardPlugin(),
        placeholderPlugin(),
      ],
    });

    view = new EditorView(editorRef, {
      state,
      nodeViews,
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
              atomFingerprint(oldDoc) !== atomFingerprint(view.state.doc);
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

    const doc = createDoc(query);
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

  /** Public: get the current serialized query. */
  export { getQuery };

  /** Public: get the EditorView instance (for programmatic node insertion in tests). */
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
    <span class="search-chip search-field-value context-chip">
      <span class="chip-field">{chip.field}:</span>
      <span class="chip-value">{chip.label}</span>
    </span>
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

  .context-chip {
    flex: 0 0 auto;
    opacity: 0.8;
    cursor: default;
    user-select: none;
  }

  .chip-field {
    opacity: 0.7;
    margin-right: 2px;
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

  /* Chip styles (used by atom nodes in future phases) */
  :global(.search-chip) {
    display: inline;
    border-radius: 3px;
    padding: 2px 4px;
    margin: 0 2px;
    white-space: nowrap;
  }

  :global(.search-field-value) {
    background-color: #e6f7ff;
  }

  :global(.search-range) {
    background-color: #f0f7ff;
  }

  :global(.search-sort) {
    background-color: #f0f5ff;
  }

  /* Wavy underline for syntax errors */
  :global(.search-syntax-error) {
    text-decoration-line: underline;
    text-decoration-style: wavy;
    text-decoration-color: var(--red-3);
  }

  /* Selected chip — ProseMirror adds this class when an atom node is selected */
  :global(.ProseMirror-selectednode .search-chip) {
    outline: 1px solid var(--blue-3, #0969da);
    outline-offset: 1px;
    border-radius: 3px;
  }
</style>
