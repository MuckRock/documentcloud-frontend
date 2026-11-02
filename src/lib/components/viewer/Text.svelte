<!--
  @component
  Text wraps a list of Page components with plain text contents
  
  Must be a child of a ViewerContext
-->
<script lang="ts">
  import { page } from "$app/state";
  import { onMount, tick } from "svelte";

  import Page from "./Page.svelte";
  import Virtualizer from "$lib/components/viewer/Virtualizer.svelte";
  import { getViewerState } from "$lib/state/viewer.svelte";
  import { highlight } from "$lib/utils/search";
  import { getQuery } from "$lib/utils/search";

  let { query = getQuery(page.url, "q") } = $props();

  const viewer = getViewerState();

  let keepMounted = $derived.by(() => {
    const MOUNTED = 200;
    const pageCount = viewer.pageSizes.length;
    const start = Math.max(
      0,
      Math.min(viewer.page - 1 - MOUNTED / 2, pageCount - MOUNTED),
    );
    const end = Math.min(pageCount, start + MOUNTED);
    return Array.from({ length: end - start }, (_, i) => start + i);
  });

  onMount(async () => {
    if (viewer.page > 1) {
      // The pages aren't rendered by virtua until the next tick
      await tick();
      viewer.goToPage(viewer.page);
    }
  });
</script>

<div
  bind:this={viewer.innerContainer}
  class="textPages"
  style:--zoom={+viewer.zoom || 1}
>
  {#await viewer.text then text}
    <Virtualizer
      data={text?.pages ?? []}
      getKey={({ page }) => page}
      {keepMounted}
    >
      {#snippet children({ page, contents })}
        <Page page_number={page + 1} track>
          <pre>
      {@html highlight(contents, query)}
    </pre>
        </Page>
      {/snippet}
    </Virtualizer>
  {/await}
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
    text-wrap: balance;
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
