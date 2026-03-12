<!--
  SearchEditor is ProseMirror-based search field for constructing Lucene queries.

  It supports autofilling field names and values with static and dynamic suggestions.

  The PM document is the source of truth for the query.
  Serialization to a Lucene string happens only on submit.
  Deserialization from a Lucene string happens when the initialQuery prop changes.

  SearchEditor was written by Allan Lasser with assistance from Claude Opus 4.6.
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { EditorView } from "prosemirror-view";
  import type { Suggestion } from "./prosemirror/plugins/autocomplete-data";
  import {
    createSearchEditor,
    updateEditorQuery,
    getEditorQuery,
  } from "./prosemirror/searchEditor";

  import { Search16, Stop16 } from "svelte-octicons";
  import Button from "$lib/components/common/Button.svelte";
  import FieldValueChip from "$lib/components/documents/search/FieldValueChip.svelte";

  interface Props {
    initialQuery?: string;
    /** Locked chips displayed before the editor as search context (e.g. project scope). */
    contextChips?: Array<{
      field: string;
      label: string;
    }>;
    /**
     * Preloaded suggestions derived from current search results.
     * Keyed by canonical field name (e.g. "user", "organization").
     * Used as default suggestions when the autocomplete filter is empty,
     * avoiding an API call and showing contextually relevant values.
     */
    preloadedSuggestions?: Record<string, Suggestion[]>;
    onsubmit?: (detail: { q: string }) => void;
    onchange?: (detail: { q: string; structural: boolean }) => void;
  }

  let {
    initialQuery = "",
    contextChips = [],
    preloadedSuggestions = {},
    onsubmit,
    onchange,
  }: Props = $props();

  let editorRef: HTMLDivElement | undefined = $state();
  let view: EditorView | undefined = $state();

  /** Whether the current query is valid Lucene syntax. */
  let queryValid = $state(true);

  /** Last query emitted via the change event, to avoid redundant dispatches. */
  let lastEmittedQuery = initialQuery;

  // When the initialQuery prop changes externally (e.g. route navigation),
  // update the editor contents to match — but NOT while the user is actively
  // typing (editor has focus), to avoid disrupting their input.
  let lastInitialQuery = $state(initialQuery);

  /** Upon submission, serialize the current PM document to a Lucene query string. */
  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!queryValid) return;
    const query = view ? getEditorQuery(view) : initialQuery;
    onsubmit?.({ "q": query });
  }

  onMount(() => {
    view = createSearchEditor(editorRef!, {
      initialQuery,
      getPreloadedSuggestions: () => preloadedSuggestions,
      onDocChange(q, structural, valid) {
        queryValid = valid;
        if (q !== lastEmittedQuery) {
          lastEmittedQuery = q;
          // Only emit change for structural changes (chip insert/remove).
          // Plain text typing should not trigger searches — the user must
          // explicitly submit the form for text-only queries.
          if (structural) {
            onchange?.({ q, structural });
          }
        }
      },
    });
  });

  onDestroy(() => {
    if (view) {
      view.destroy();
    }
  });

  /** Public: update the editor with a new query string. */
  export function updateQuery(query: string) {
    if (!view) return;
    updateEditorQuery(view, query);
  }

  /** Get the current serialized query. Used by tests. */
  export function getQuery(): string {
    if (!view) return initialQuery;
    return getEditorQuery(view);
  }

  /** Get the EditorView instance for programmatic node insertion. Used by tests. */
  export function getView(): EditorView {
    return view!;
  }

  $effect(() => {
    if (view && initialQuery !== lastInitialQuery) {
      lastInitialQuery = initialQuery;
      if (!view.hasFocus()) {
        updateQuery(initialQuery);
      }
    }
  });
</script>

<form class="search-editor-container" onsubmit={handleSubmit}>
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
