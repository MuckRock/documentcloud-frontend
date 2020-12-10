<script>
  import RedactPane from "./RedactPane";
  import AnnotatePane from "./AnnotatePane";
  import ModifyPane from "./ModifyPane";
  import SearchPane from "./SearchPane";
  import SelectNotePane from "./SelectNotePane";
  import { layout } from "@/viewer/layout";
  import { cancelActions } from "@/viewer/document";

  // SVG assets
  import closeSvg from "@/assets/close.svg";

  export let actionHeight;

  function handleKeyDown(e) {
    if (e.key == "Escape") cancelActions();
  }
</script>

<style lang="scss">
  .actionpane {
    position: absolute;
    left: 0;
    background: #fffdea;
    z-index: $viewerActionPaneZ;
    padding: 20px;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.25);
    display: table;
    box-sizing: border-box;

    > * {
      display: table-cell;
      vertical-align: top;
    }

    .actioncontent {
      padding: 0 25px;
      width: 100%;

      :global(h3) {
        font-size: 16px;
        margin: 0;
        margin: 12px 0;
        color: $viewerDarkGray;
      }

      :global(p) {
        font-size: 14px;
        color: $viewerDarkGray;
      }

      :global(.buttonpadded) {
        margin: 0 -4px;

        :global(button) {
          margin: 0 4px;
        }
      }
    }
  }
</style>

<!-- Action pane -->
{#if $layout.action != null}
  <div
    class="actionpane"
    style="top: {$layout.headerHeight}px; right: {$layout.sidebarWidth}px"
    bind:clientHeight={actionHeight}>
    <div class="actionclose">
      <span on:click={cancelActions}>
        {@html closeSvg}
      </span>
    </div>
    <div class="actioncontent">
      {#if $layout.selectNoteEmbed}
        <SelectNotePane />
      {:else if $layout.redacting}
        <RedactPane />
      {:else if $layout.annotating}
        <AnnotatePane />
      {:else if $layout.modifying}
        <ModifyPane />
      {:else if $layout.searching}
        <SearchPane />
      {/if}
    </div>
  </div>
{/if}

<svelte:window on:keydown={handleKeyDown} />
