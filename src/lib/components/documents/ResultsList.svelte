<script context="module" lang="ts">
  import { writable, type Writable } from "svelte/store";

  export const selected: Writable<number[] | string[]> = writable([]);
</script>

<script lang="ts">
  import type { DocumentResults } from "$lib/api/types";
  import DocumentListItem from "./DocumentListItem.svelte";
  import { onMount } from "svelte";

  export let results: DocumentResults;

  onMount(() => {
    // @ts-ignore
    window.searchResults = results;
  });
</script>

<div class="results">
  {#each results.results as document (document.id)}
    <div class="row">
      <input type="checkbox" value={document.id} bind:group={$selected} />
      <DocumentListItem {document} />
    </div>
  {/each}
</div>

<style>
  .results {
    display: flex;
    padding: 1rem 0.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    align-self: stretch;
  }

  .row {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 0.625rem;
  }

  .row input[type="checkbox"] {
    height: 1.25rem;
    width: 1.25rem;
    cursor: pointer;
  }
</style>
