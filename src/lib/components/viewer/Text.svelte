<!--
  @component
  Text wraps a list of Page components with plain text contents
  
  Assumes it's a child of a ViewerContext
-->
<script lang="ts">
  import { onMount } from "svelte";

  import { scrollToPage } from "$lib/utils/scroll";
  import { highlight } from "$lib/utils/search";

  import Page from "./Page.svelte";
  import { getText, getCurrentPage, getQuery } from "./ViewerContext.svelte";

  export let zoom: number = 1;

  const text = getText();
  const query = getQuery();
  const currentPage = getCurrentPage();

  onMount(async () => {
    if ($currentPage > 1) {
      scrollToPage($currentPage);
    }
  });
</script>

<div class="textPages" style:--zoom={zoom}>
  {#each text?.pages as { page, contents }}
    <Page page_number={page + 1} track>
      <pre>
        {@html highlight(contents, query)}
      </pre>
    </Page>
  {/each}
</div>

<style>
  .textPages {
    max-width: 48rem;
    padding: 0 1rem;
    margin: 0 auto;
    width: 100%;
  }

  pre {
    background-color: var(--white, #fff);
    margin: 0;
    padding: 1.5rem;
    text-wrap: pretty;
    word-break: break-word;

    color: var(--gray-5, #233944);
    font-family: var(--font-mono, "Source Code Pro", monospace);
    font-size: calc(var(--font-xs) * var(--zoom, 1));
    line-height: calc(1.25rem * var(--zoom, 1));
    box-shadow: var(--shadow-1);
    width: 100%;
  }

  pre :global(mark) {
    background: var(--note-public, mark);
  }
</style>
