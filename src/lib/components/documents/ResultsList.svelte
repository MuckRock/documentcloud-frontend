<script context="module" lang="ts">
  import { writable, type Writable } from "svelte/store";

  export const selected: Writable<(number | string)[]> = writable([]);
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import type { DocumentResults } from "$lib/api/types";
  import DocumentListItem from "./DocumentListItem.svelte";
  import Flex from "../common/Flex.svelte";
  import Checkbox from "../common/Checkbox.svelte";
  import { Hourglass24, Search24 } from "svelte-octicons";
  import Empty from "../common/Empty.svelte";

  export let results: DocumentResults = undefined;

  function updateSelection(event: Event, id: string | number) {
    const { checked } = event.target as HTMLInputElement;
    if (checked) {
      selected.set([...$selected, id]);
    } else {
      selected.set([...$selected.filter((d) => d !== id)]);
    }
  }
</script>

<div class="container">
  {#if !results}
    <Empty icon={Hourglass24}>Loading…</Empty>
  {:else}
    {#each results.results as document (document.id)}
      <Flex gap={0.625} align="center">
        <Checkbox
          checked={$selected.includes(document.id)}
          on:change={(event) => updateSelection(event, document.id)}
        />
        <DocumentListItem {document} />
      </Flex>
    {:else}
      <Empty icon={Search24}>
        <h2>{$_("noDocuments.noSearchResults")}</h2>
        <p>{$_("noDocuments.queryNoResults")}</p>
      </Empty>
    {/each}
  {/if}
</div>

<style>
  .container {
    padding: 0 2rem;
  }
</style>
