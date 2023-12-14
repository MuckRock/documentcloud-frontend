<script>
  import { layout } from "@/viewer/layout.js";
  import { doc } from "@/viewer/document.js";

  import AllText from "./AllText.svelte";
  import SearchResults from "./SearchResults.svelte";

  let docElem;

  $: {
    if (docElem != null) {
      doc.simpleDocElem = docElem;
    }
  }

  let scrollParams = { scrollTop: 0 };

  function handleScroll() {
    scrollParams = {
      scrollTop: docElem.scrollTop,
    };
  }
</script>

<div
  style="top: {$layout.headerHeight}px; bottom: {$layout.footerHeight}px; right:
  {$layout.sidebarWidth}px;"
  bind:this={docElem}
  on:scroll={handleScroll}
  class="doc"
  class:grayed={$layout.displayAnnotate}
>
  {#if $doc.mode == "text"}
    <AllText {scrollParams} />
  {:else if $doc.mode == "search"}
    <SearchResults />
  {/if}
</div>

<style lang="scss">
  .doc {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    box-sizing: border-box;
    overflow: auto;
    z-index: $viewerBodyZ;
    touch-action: manipulation;
    background: $viewerBodyBg;

    :global(img) {
      background: white;
    }

    &.grayed {
      background: $viewerBodyBgDarker;
    }
  }
</style>
