<script lang="ts">
  import type { Document, User } from "$lib/api/types";
  import { setContext, untrack } from "svelte";
  import { writable } from "svelte/store";

  import DocumentActions from "../DocumentActions.svelte";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";

  interface Props {
    docs?: Document[];
    user?: User | null;
  }

  const { docs = [], user = null }: Props = $props();

  const search = new SearchResultsState();
  untrack(() => {
    for (const d of docs) {
      search.visible.set(String(d.id), d);
      search.selectedIds.add(String(d.id));
    }
  });
  setSearchResults(search);

  setContext("me", writable(untrack(() => user)));
</script>

<DocumentActions />
