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

    &.disabled {
      pointer-events: none;
      filter: brightness(90%);
    }
  }

  .cell {
    display: table-cell;
    vertical-align: middle;

    &.side {
      width: 200px;
      text-align: left;
      padding: 0 0 0 16px;

      &.right {
        text-align: right;
        padding: 0 16px 0 0;
      }
    }

    &.center {
      text-align: center;
    }

    &.floatleft {
      @media only screen and (max-width: $earlyBreak) {
        position: absolute;
        left: 0;
        top: 6px;
      }
    }

    &.floatright {
      @media only screen and (max-width: $earlyBreak) {
        position: absolute;
        right: -15px;
        top: 6px;
      }
    }
  }

  .hide {
    &.ib {
      display: inline-block;

      @media only screen and (max-width: $mobileBreak) {
        display: none;
      }
    }

    @media only screen and (max-width: $mobileBreak) {
      display: none;
    }

    &.hideearly {
      @media only screen and (max-width: $earlyBreak) {
        display: none;
      }
    }
  }
</style>

<footer
  class="vheader"
  class:disabled={$layout.disableControls}
  style="height: {$layout.footerHeight}px"
>
  <div class="vcontent">
    {#if !$layout.compact}
      <div class="cell side hide floatleft" {style}>
        <ViewDropdown />
      </div>
      <div class="cell center" {style}>
        <Paginator />
      </div>
      <div class="cell side right floatright" {style}>
        <span class="hide ib" class:hideearly={$layout.embed}>
          <Zoom />
        </span>
        {#if $layout.embed}
          <FullScreen />
        {/if}
      </div>
    {/if}
  </div>
</footer>
