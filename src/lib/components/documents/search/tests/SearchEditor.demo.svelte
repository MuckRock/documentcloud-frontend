<script lang="ts">
  import type { EditorView } from "prosemirror-view";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";
  import SearchEditor from "../SearchEditor.svelte";

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

<SearchEditor bind:this={editor} {query} {contextAtoms} {onsubmit} {onchange} />
