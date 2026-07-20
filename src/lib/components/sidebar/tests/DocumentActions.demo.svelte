<script lang="ts">
  import type { Document } from "$lib/api/types";
  import { untrack } from "svelte";

  import DocumentActions from "../DocumentActions.svelte";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";

  interface Props {
    docs?: Document[];
  }

  const { docs = [] }: Props = $props();

  const search = new SearchResultsState();
  untrack(() => {
    for (const d of docs) {
      search.visible.set(String(d.id), d);
      search.selectedIds.add(String(d.id));
    }
  });
  setSearchResults(search);
</script>

<DocumentActions />
