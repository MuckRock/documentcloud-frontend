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
    validateEditorQuery,
    isEditorInErrorMode,
  } from "./prosemirror/searchEditor";

  import { Search16, Stop16 } from "svelte-octicons";
  import Button from "$lib/components/common/Button.svelte";
  import FieldValueAtom from "$lib/components/documents/search/FieldValueAtom.svelte";

  interface Props {
    initialQuery?: string;
    /** Locked atoms displayed before the editor as search context (e.g. project scope). */
    contextAtoms?: Array<{
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
    contextAtoms = [],
    preloadedSuggestions = {},
    onsubmit,
    onchange,
  }: Props = $props();

  let editorRef: HTMLDivElement | undefined = $state();
  let view: EditorView | undefined = $state();

  /** Whether the editor is showing validation errors. */
  let hasErrors = $state(false);

  /** Last query emitted via the change event, to avoid redundant dispatches. */
  // svelte-ignore state_referenced_locally
  let lastEmittedQuery = $state(initialQuery);

  // When the initialQuery prop changes externally (e.g. route navigation),
  // update the editor contents to match — but NOT while the user is actively
  // typing (editor has focus), to avoid disrupting their input.
  // svelte-ignore state_referenced_locally
  let lastInitialQuery = $state(initialQuery);

  /** Upon submission, validate and serialize the current PM document to a Lucene query string. */
  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!view) return;
    if (!validateEditorQuery(view)) {
      hasErrors = true;
      return;
    }
    hasErrors = false;
    const query = getEditorQuery(view);
    onsubmit?.({ q: query });
  }

  onMount(() => {
    view = createSearchEditor(editorRef!, {
      initialQuery,
      getPreloadedSuggestions: () => preloadedSuggestions,
      onDocChange(q, structural) {
        // Sync error state with the decoration plugin (it clears errors
        // automatically when the query becomes valid while in error mode)
        if (hasErrors) {
          hasErrors = isEditorInErrorMode(view!);
        }
        if (q !== lastEmittedQuery) {
          lastEmittedQuery = q;
          // Only emit change for structural changes (atom insert/remove).
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

<form
  class="search-editor-container"
  aria-label="Search documents"
  onsubmit={handleSubmit}
>
  <div class="search-editor-status" class:invalid={hasErrors}>
    {#if hasErrors}
      <Stop16 />
    {:else}
      <Search16 />
    {/if}
  </div>
  {#each contextAtoms as atom}
    <FieldValueAtom field={atom.field} value={atom.label} locked />
  {/each}
  <div
    bind:this={editorRef}
    class="prosemirror-editor"
    role="textbox"
    aria-label="Search documents"
    aria-invalid={hasErrors ? true : undefined}
  ></div>
  <Button
    type="submit"
    mode="primary"
    ghost
    minW={false}
    disabled={hasErrors}
    aria-label="Search">Search</Button
  >
  <div class="sr-only" aria-live="assertive" aria-atomic="true">
    {#if hasErrors}Query syntax error{/if}
  </div>
</form>

<style>
  .search-editor-container {
    flex: 1 1 auto;
    min-width: 0;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: white;
    position: relative;
    display: flex;
    align-items: center;
    margin: 0.25rem 0;
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
    min-width: 0;
    overflow: hidden;
    padding: 0.375rem 0.75rem;
    text-align: left;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
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
    white-space: nowrap;
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
    color: var(--green-4);
    font-weight: 600;
  }

  :global(.search-prefix-excluded) {
    color: var(--orange-4);
    font-weight: 600;
  }

  :global(.search-term-required) {
    background-color: var(--green-1);
    border-radius: 3px;
  }

  :global(.search-term-excluded) {
    background-color: var(--red-1);
    border-radius: 3px;
  }

  /* Merge rounded corners for adjacent spans of the same highlight */
  :global(.search-term-required + .search-term-required) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  :global(.search-term-required:has(+ .search-term-required)) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  :global(.search-term-excluded + .search-term-excluded) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  :global(.search-term-excluded:has(+ .search-term-excluded)) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  /* Atom styles */
  :global(.search-atom) {
    display: inline;
    border-radius: 0.25rem;
    padding: 0 4px;
    margin: 0 2px;
    white-space: nowrap;
  }

  /* Selected atom — ProseMirror adds this class when an atom node is selected */
  :global(.ProseMirror-selectednode .search-atom) {
    outline: 1px solid var(--blue-3);
    border-radius: 0.25rem;
  }

  /* Wavy underline for syntax errors */
  :global(.search-syntax-error) {
    text-decoration-line: underline;
    text-decoration-style: wavy;
    text-decoration-color: var(--red-3);
  }
</style>
