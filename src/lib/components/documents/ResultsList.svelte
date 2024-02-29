<script context="module" lang="ts">
  import { writable, type Writable } from "svelte/store";

  export const selected: Writable<(number | string)[]> = writable([]);
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import type { DocumentResults } from "$lib/api/types";
  import Search from "../Search.svelte";
  import PageToolbar from "../common/PageToolbar.svelte";
  import DocumentListItem from "./DocumentListItem.svelte";
  import Flex from "../common/Flex.svelte";
  import Checkbox from "../common/Checkbox.svelte";
  import { Search24 } from "svelte-octicons";
  import Empty from "../common/Empty.svelte";

  export let results: DocumentResults;

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
  <header>
    <PageToolbar><Search slot="center" /></PageToolbar>
  </header>
  <main>
    {#each results.results as document (document.id)}
      <Flex gap={0.625} align="center">
        <Checkbox
          value={document.id}
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
  </main>
  <footer>
    <PageToolbar />
  </footer>
</div>

<style>
  .container {
    display: flex;
    padding: 0;
    flex-direction: column;
    align-items: flex-start;
    flex: 1 0 0;
    align-self: stretch;
    position: relative;
  }
  header {
    flex: 1 0 0;
    width: 100%;
    position: sticky;
    top: 0.5rem;
    margin: 0.5rem 0;
  }
  main {
    flex: 1 0 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0.5rem;
  }
  footer {
    flex: 1 0 0;
    width: 100%;
    position: sticky;
    bottom: 0.5rem;
    margin: 0.5rem 0;
  }
</style>
