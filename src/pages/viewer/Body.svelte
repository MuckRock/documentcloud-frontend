<script>
  import Page from "./Page";
  import { onMount } from "svelte";
  import { viewer } from "@/viewer/viewer";
  import { renderer } from "@/viewer/renderer";

  let body;

  function updateDimension() {
    $renderer.bodyHeight = body.offsetHeight;
    $renderer.top = body.scrollTop;
  }

  function handleShift({ detail: shift }) {
    body.scrollTop += shift;
  }

  onMount(() => {
    if (body.offsetWidth < $renderer.width) {
      $renderer.width = body.offsetWidth - $renderer.pageRail * 2;
    }
    updateDimension();
  });
</script>

<style lang="scss">
  .body {
    background: $viewerBodyBg;
    position: absolute;
    top: $viewerHeaderHeight;
    bottom: $viewerFooterHeight;
    width: 100%;
    z-index: $viewerBodyZ;
    overflow: auto;
  }
</style>

<div class="body" bind:this={body} on:scroll={updateDimension}>
  {#if $viewer.loaded}
    {#each $renderer.elementsToShow as chunk (chunk.type == 'page' ? chunk.number : `space${chunk.height}`)}
      {#if chunk.type == 'space'}
        <div style="height: {chunk.height}px" />
      {:else if chunk.type == 'page'}
        <Page
          on:shift={handleShift}
          document={$viewer.document}
          pageNumber={chunk.number}
          aspect={$renderer.computedAspects[chunk.number].aspect} />
      {/if}
    {/each}
  {/if}
</div>

<svelte:window on:resize={updateDimension} />
