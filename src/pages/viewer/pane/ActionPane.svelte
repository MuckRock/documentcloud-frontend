<script>
  import RedactPane from "./RedactPane.svelte";
  import AnnotatePane from "./AnnotatePane.svelte";
  import ModifyPane from "./ModifyPane.svelte";
  import SearchPane from "./SearchPane.svelte";
  import SelectNotePane from "./SelectNotePane.svelte";
  import { layout } from "@/viewer/layout.js";
  import { cancelActions } from "@/viewer/document.js";

  // SVG assets
  import { XCircle24 } from "svelte-octicons";

  export let actionHeight;

  function handleKeyDown(e) {
    if (e.key == "Escape") cancelActions();
  }
</script>

<style>
  .actionpane {
    position: absolute;
    left: 0;
    background: var(--actionPane, #fffdea);
    z-index: var(--viewerActionPaneZ, 5);
    padding: 20px;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.25);
    display: table;
    box-sizing: border-box;
  }
  .actionpane > * {
    display: table-cell;
    vertical-align: top;
  }

  .actioncontent {
    padding: 0 25px;
    width: 100%;
  }

  .actioncontent :global(h3) {
    font-size: 16px;
    margin: 0;
    margin: 12px 0;
    color: var(--viewerDarkGray, #171717);
  }

  .actioncontent :global(p) {
    font-size: 14px;
    color: var(--viewerDarkGray, #171717);
  }

  .actioncontent :global(.buttonpadded) {
    margin: 0 -4px;
  }

  .actioncontent :global(.buttonpadded) :global(button) {
    margin: 0 4px;
  }
</style>

<!-- Action pane -->
{#if $layout.action !== null}
  <div
    class="actionpane"
    style="top: {$layout.headerHeight}px; right: {$layout.sidebarWidth}px"
    bind:clientHeight={actionHeight}
  >
    <div class="actionclose">
      <button class="buttonLike" on:click={cancelActions}>
        <XCircle24 />
      </button>
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
