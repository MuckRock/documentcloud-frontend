<script context="module" lang="ts">
  import { writable, type Writable } from "svelte/store";
  import Button from "../common/Button.svelte";

  export const selected: Writable<(number | string)[]> = writable([]);
</script>

<script lang="ts">
  import type { Document, DocumentResults } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import DocumentListItem from "./DocumentListItem.svelte";
  import Flex from "../common/Flex.svelte";
  import { Search24 } from "svelte-octicons";
  import Empty from "../common/Empty.svelte";

  export let results: Document[] = [];
  export let count: number = undefined;
  export let next: string | null = null;

  let loading = false;

  // load the next set of results
  async function load(url: URL) {
    loading = true;
    const res = await fetch(url, { credentials: "include" });

    if (!res.ok) {
      // todo: better error handling
      console.error(res.statusText);
      loading = false;
    }

    const r: DocumentResults = await res.json();

    results = [...results, ...r.results];
    count = r.count;
    next = r.next;
    loading = false;
  }
</script>

<div class="container">
  {#each results as document (document.id)}
    <Flex gap={0.625} align="center">
      <label>
        <span class="sr-only">Select</span>
        <input type="checkbox" bind:group={$selected} value={document.id} />
      </label>
      <DocumentListItem {document} />
    </Flex>
  {:else}
    <Empty icon={Search24}>
      <h2>{$_("noDocuments.noSearchResults")}</h2>
      <p>{$_("noDocuments.queryNoResults")}</p>
    </Empty>
  {/each}
  <div class="end">
    {#if next}
      <Button on:click={(e) => load(new URL(next))}>Load more</Button>
    {/if}
  </div>
</div>

<style>
  .container {
    padding: 0 2rem;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  input[type="checkbox"] {
    height: 1.25rem;
    width: 1.25rem;
  }
</style>
