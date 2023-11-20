<script lang="ts">
  // Controls
  import ViewDropdown from "./controls/ViewDropdown.svelte";
  import Paginator from "./controls/Paginator.svelte";
  import Zoom from "./controls/Zoom.svelte";
  import FullScreen from "./controls/FullScreen.svelte";

  import { FOOTER_HEIGHT } from "./constants";

  export let disableControls = false;
  export let compact = false;
  export let embed = false;
  export let showFullscreen = false;

  $: style = `height: ${FOOTER_HEIGHT}px;`;
</script>

<style>
  footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: var(--viewerHeaderBorder);
    z-index: var(--viewerFooterZ);
    text-align: center;
  }

  footer.disabled {
    pointer-events: none;
    filter: brightness(90%);
  }

  .cell {
    display: table-cell;
    vertical-align: middle;
  }

  .cell.side {
    width: 200px;
    text-align: left;
    padding: 0 0 0 16px;
  }

  .cell.side.right {
    text-align: right;
    padding: 0 16px 0 0;
  }

  .cell.center {
    text-align: center;
  }

  .hide.ib {
    display: inline-block;
  }

  @media only screen and (max-width: 720px) {
    .hide {
      display: none;
    }
    .hide.ib {
      display: none;
    }
  }

  @media only screen and (max-width: 900px) {
    .cell.floatright {
      position: absolute;
      right: -14px;
      top: 5px;
      width: auto;
    }
    .cell.floatleft {
      position: absolute;
      left: 0;
      top: 6px;
    }
    .adjustright {
      margin-top: -2px;
      margin-right: 14px;
    }
    .hide.hideearly {
      display: none;
    }
  }
</style>

<footer class="vheader" class:disabled={disableControls} {style}>
  <div class="vcontent">
    {#if !compact}
      <div class="cell side hide floatleft" {style}>
        <ViewDropdown />
      </div>
      <div class="cell center" {style}>
        <Paginator />
      </div>
      <div class="cell side right floatright" {style}>
        <span class="hide ib adjustright" class:hideearly={embed}>
          <Zoom />
        </span>
        {#if embed && showFullscreen}
          <FullScreen />
        {/if}
      </div>
    {/if}
  </div>
</footer>
