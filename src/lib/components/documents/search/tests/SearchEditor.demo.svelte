<script lang="ts">
  import type { EditorView } from "prosemirror-view";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";
  import SearchEditor from "../SearchEditor.svelte";
  import { extractSuggestions } from "$lib/components/documents/search/utils/extractSuggestions";

  interface Props {
    query?: string;
    contextAtoms?: Array<{ field: string; label: string }>;
    onsubmit?: (detail: { q: string }) => void;
    onchange?: (detail: { q: string; structural: boolean }) => void;
  }

  let { query, contextAtoms, onsubmit, onchange }: Props = $props();

  const search = new SearchResultsState();
  setSearchResults(search);

  let editor: SearchEditor | undefined = $state();

  let suggestions = $derived(extractSuggestions(search.results));

  export function updateQuery(query: string) {
    editor?.updateQuery(query);
  }

  export function getQuery(): string {
    return editor?.getQuery() ?? "";
  }

  export function getView(): EditorView {
    return editor!.getView();
  }
</script>

<SearchEditor bind:this={editor} {query} {contextAtoms} {suggestions} {onsubmit} {onchange} />
