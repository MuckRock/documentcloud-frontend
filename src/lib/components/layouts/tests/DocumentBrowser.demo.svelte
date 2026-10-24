<script lang="ts">
  import { setContext, untrack } from "svelte";
  import type { Project } from "$lib/api/types";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";
  import DocumentBrowser from "../DocumentBrowser.svelte";

  let {
    embed = false,
    project = null,
  }: { embed?: boolean; project?: Project | null } = $props();
  setContext(
    "embed",
    untrack(() => embed),
  );
  setSearchResults(new SearchResultsState());
</script>

<DocumentBrowser {project} />
