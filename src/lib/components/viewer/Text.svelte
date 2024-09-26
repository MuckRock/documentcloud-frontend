<!--
  @component
  Text wraps a list of TextPage components for loading and management
-->
<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Document, DocumentText } from "$lib/api/types";

  import { getContext, onMount } from "svelte";

  import Page from "./Page.svelte";
  import TextPage from "./TextPage.svelte";

  import { scrollToPage } from "$lib/utils/scroll";
  import { isEmbedded } from "@/lib/utils/viewer";

  export let document: Document;
  export let query: string = ""; // search query
  export let text: DocumentText;
  export let total: number = 0;
  export let zoom: number = 1;
  export let embed = isEmbedded();

  const currentPage: Writable<number> = getContext("currentPage");

  onMount(async () => {
    if ($currentPage > 1) {
      scrollToPage($currentPage);
    }
  });
</script>

<div class="textPages" style:--zoom={zoom}>
  {#await text}
    <!-- loading state-->
    {#each Array(total).fill(null) as p, n}
      <Page {document} {embed} page_number={n + 1} mode="text">
        <div class="placeholder"></div>
      </Page>
    {/each}
  {:then { pages }}
    {#each pages as { page, contents }}
      <TextPage {document} {page} {contents} {query} {embed} />
    {/each}
  {/await}
</div>

<style>
  .textPages {
    max-width: 48rem;
    padding: 0 1rem;
    margin: 0 auto;
    width: 100%;
  }

  .placeholder {
    aspect-ratio: calc(11 / 8.5);
    background-color: var(--white, white);
    box-shadow: var(--shadow-1);
    width: 66ch;
  }
</style>
