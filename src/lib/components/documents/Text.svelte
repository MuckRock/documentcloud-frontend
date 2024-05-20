<!--
  @component
  Text wraps a list of TextPage components for loading and management
-->
<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { DocumentText } from "$lib/api/types";

  import { getContext, onMount } from "svelte";

  import Page from "./Page.svelte";
  import TextPage from "./TextPage.svelte";

  import { scrollToPage } from "$lib/utils/scroll";

  export let text: Promise<DocumentText> | DocumentText;

  export let total: number = 0;
  export let zoom: number = 1;

  const currentPage: Writable<number> = getContext("currentPage");

  onMount(async () => {
    await text; // wait until it loads
    if ($currentPage > 1) {
      scrollToPage($currentPage);
    }
  });
</script>

<div class="textPages" style:--zoom={zoom}>
  {#await text}
    <!-- loading state-->
    {#each Array(total).fill(null) as p, n}
      <Page page_number={n + 1} mode="text">
        <div class="placeholder"></div>
      </Page>
    {/each}
  {:then { pages }}
    {#each pages as { page, contents }}
      <TextPage {page} {contents} />
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
    box-shadow: var(--shadow);
    width: 66ch;
  }
</style>
