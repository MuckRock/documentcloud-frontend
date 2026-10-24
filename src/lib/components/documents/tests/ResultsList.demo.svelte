<script lang="ts">
  import type { Document, APIError } from "$lib/api/types";
  import type { Snippet } from "svelte";
  import { writable } from "svelte/store";
  import { setContext, untrack } from "svelte";

  import ResultsList from "../ResultsList.svelte";
  import {
    defaultVisibleFields,
    setVisibleFieldsContext,
  } from "../VisibleFields.svelte";
  import { SearchResultsState } from "$lib/state/search.svelte";

  interface Props {
    results?: Document[];
    auto?: boolean;
    preload?: "hover" | "tap";
    start?: Snippet;
    end?: Snippet;
    error?: APIError<unknown>;
  }

  let {
    results = [],
    auto = false,
    preload = "hover",
    start,
    end,
    error,
  }: Props = $props();

  // Set up contexts needed by ResultsList
  setContext("embed", false);
  setVisibleFieldsContext(writable(defaultVisibleFields));

  const search = new SearchResultsState();
  untrack(() => {
    for (const d of results) {
      search.visible.set(String(d.id), d);
    }
    search.total = results.length;
    search.error = error;
  });
</script>

<ResultsList {search} {auto} {preload} {start} {end} />
