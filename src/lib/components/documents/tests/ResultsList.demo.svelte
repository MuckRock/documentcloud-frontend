<script lang="ts">
  import type { Document } from "$lib/api/types";
  import type { Snippet } from "svelte";
  import { writable } from "svelte/store";
  import { setContext, untrack } from "svelte";

  import ResultsList from "../ResultsList.svelte";
  import {
    defaultVisibleFields,
    setVisibleFieldsContext,
  } from "../VisibleFields.svelte";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";

  interface Props {
    results?: Document[];
    auto?: boolean;
    preload?: "hover" | "tap";
    start?: Snippet;
    end?: Snippet;
    children?: Snippet;
  }

  let {
    results = [],
    auto = false,
    preload = "hover",
    start,
    end,
    children,
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
  });
  setSearchResults(search);
</script>

{#if children}
  {@render children()}
{:else}
  <ResultsList {auto} {preload} {start} {end} />
{/if}
