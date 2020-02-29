<script>
  // Controls
  import ViewDropdown from "./controls/ViewDropdown";
  import Paginator from "./controls/Paginator";
  import Zoom from "./controls/Zoom";
  import FullScreen from "./controls/FullScreen";

  import { layout } from "@/viewer/layout";

  $: style = `height: ${$layout.footerHeight}px;`;
</script>

<style lang="scss">
  footer {
    position: absolute;
    bottom: 0;
    border-top: $viewerHeaderBorder;
    z-index: $viewerFooterZ;
    text-align: center;
  }

  .cell {
    display: table-cell;
    vertical-align: middle;

    &.side {
      width: 200px;

      @media only screen and (max-width: 600px) {
        display: none;
      }
    }

    &.center {
      text-align: center;
    }
  }
</style>

<footer class="vheader" style="height: {$layout.footerHeight}px">
  <div class="vcontent">
    {#if !$layout.compact}
      <div class="cell side" {style}>
        <ViewDropdown />
      </div>
      <div class="cell center" {style}>
        <Paginator />
      </div>
      <div class="cell side" {style}>
        <Zoom />
        {#if $layout.embed}
          <FullScreen />
        {/if}
      </div>
    {/if}
  </div>
</footer>
