<!--
  SearchEditor: A ProseMirror-based search field for constructing Lucene queries.

  The PM document is the source of truth for the query. Serialization to a Lucene
  string happens only on submit. No continuous parse/rebuild loop.
-->
<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { EditorState, Plugin } from "prosemirror-state";
  import { EditorView } from "prosemirror-view";
  import { keymap } from "prosemirror-keymap";
  import { baseKeymap } from "prosemirror-commands";
  import { history, undo, redo } from "prosemirror-history";
  import { Search16 } from "svelte-octicons";
  import Button from "../../common/Button.svelte";
  import { searchSchema } from "./schema";
  import { serialize } from "./pm-serialize";
  import { deserialize } from "./pm-deserialize";
  import { decorationPlugin } from "./decoration-plugin";
  import { clipboardPlugin } from "./clipboard-plugin";
  import { autocompletePlugin } from "./plugins/autocomplete";
  import "./plugins/autocomplete.css";
  import { nodeViews } from "./nodeviews";
  import { isAsyncField, fetchDisplayNames } from "./autocomplete-data";

  const dispatch = createEventDispatcher();

  export let initialQuery = "";

  let editorRef: HTMLDivElement;
  let view: EditorView;

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

  /** Serialize the current PM document to a Lucene query string. */
  function getQuery(): string {
    if (!view) return initialQuery;
    return serialize(view.state.doc);
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const query = getQuery();
    dispatch("submit", { query });
  }

  onMount(() => {
    const state = EditorState.create({
      schema: searchSchema,
      doc: createDoc(initialQuery),
      plugins: [
        history(),
        autocompletePlugin(),
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
        keymap(baseKeymap),
        decorationPlugin(),
        clipboardPlugin(),
        placeholderPlugin(),
      ],
    });

    view = new EditorView(editorRef, { state, nodeViews });
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

  /** Public: update the editor with a new query string. */
  export function updateQuery(query: string) {
    if (!view) return;
    const doc = createDoc(query);
    const tr = view.state.tr.replaceWith(
      0,
      view.state.doc.content.size,
      doc.content,
    );
    view.dispatch(tr);
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
  <div class="search-editor-status">
    <Search16 />
  </div>
  <div bind:this={editorRef} class="prosemirror-editor" role="textbox"></div>
  <Button type="submit" mode="primary" ghost minW={false}>Search</Button>
</form>

<style>
  .search-editor-container {
    width: 100%;
    min-width: 32rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: white;
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 0.25rem 0 1rem;

    caret-color: var(--blue-3, #0969da);
  }

  .search-editor-status {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  .prosemirror-editor {
    flex: 1 1 auto;
    padding: 10px;
    min-height: 36px;
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

  /* Selected chip — ProseMirror adds this class when an atom node is selected */
  :global(.ProseMirror-selectednode .search-chip) {
    outline: 1px solid var(--blue-3, #0969da);
    outline-offset: 1px;
    border-radius: 3px;
  }
</style>
