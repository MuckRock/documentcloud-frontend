<script>
  // Headers
  import CompactHeader from "./CompactHeader";
  import TitleHeader from "./TitleHeader";

  import { layout, initiateSearch } from "@/viewer/layout";
</script>

<style lang="scss">
  header {
    z-index: $viewerHeaderZ;
    position: relative;
    border-bottom: $viewerHeaderBorder;
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.35);

    &.disabled {
      pointer-events: none;
      filter: brightness(90%);
    }
  }
</style>

<header
  class="vheader"
  class:disabled={$layout.disableControls}
  style="height: {$layout.headerHeight}px">
  <div class="vcontent">
    {#if $layout.compact}
      <CompactHeader />
    {:else}
      <TitleHeader />
    {/if}
  </div>
</header>
