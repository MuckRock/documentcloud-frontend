<script lang="ts">
  import type { Document } from "$lib/api/types";
  import { setContext, untrack } from "svelte";
  import { writable } from "svelte/store";

  import DocumentList from "../DocumentList.svelte";
  import {
    defaultVisibleFields,
    setVisibleFieldsContext,
  } from "../../documents/VisibleFields.svelte";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";

  interface Props {
    docs?: Document[];
    selectedIds?: string[];
    loading?: boolean;
    query?: string;
  }

  const {
    docs = [],
    selectedIds = [],
    loading = false,
    query = "",
  }: Props = $props();

  const search = untrack(() => {
    const s = new SearchResultsState({ loading });
    for (const d of docs) {
      s.visible.set(String(d.id), d);
    }
    for (const id of selectedIds) {
      s.selectedIds.add(id);
    }
    s.total = docs.length;
    return s;
  });
  setSearchResults(search);

  setContext("embed", false);
  setVisibleFieldsContext(writable(defaultVisibleFields));
</script>

<DocumentList {query} />
