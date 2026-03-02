<script lang="ts">
  import type { Document } from "$lib/api/types";
  import { untrack } from "svelte";

  import Selection from "../Selection.svelte";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";

  interface Props {
    docs?: Document[];
    documents?: Set<string>;
    query?: string;
    resultsCount?: number;
  }

  const {
    docs = [],
    documents = new Set<string>(),
    query = undefined,
    resultsCount = undefined,
  }: Props = $props();

  const search = new SearchResultsState();
  untrack(() => {
    for (const d of docs) {
      search.visible.set(String(d.id), d);
      search.selectedIds.add(String(d.id));
    }
  });
  setSearchResults(search);
</script>

<Selection {documents} {query} {resultsCount} />
