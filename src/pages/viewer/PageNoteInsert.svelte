<script>
  import { startPageNote } from "@/viewer/layout";
  import { onDestroy } from "svelte";
  import emitter from "@/emit";
  import { _ } from "svelte-i18n";

  const emit = emitter({
    expand() {},
  });

  export let scale;
  export let expanded = false;
  export let pageNumber;

  const RETRACTED_HEIGHT = 10;
  const EXPANDED_MARGIN = 15;
  const UNEXPANDED_MARGIN = 10;

  const PLUS_SIZE = 18;
  const BORDER_SIZE = 3;

  function expand() {
    expanded = true;
    triggerUpdate();
  }

  function retract() {
    expanded = false;
    triggerUpdate();
  }

  function triggerUpdate() {
    emit.expand(expanded);
  }

  onDestroy(() => {
    retract();
  });
</script>

<style lang="scss">
  .container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .insert {
      background: rgba($privateAnnotation, 0.14);
      border-top: 3px dashed $privateAnnotation;
      border-right: 1px solid transparent;
      border-left: 1px solid transparent;
      box-sizing: border-box;
      position: absolute;
      width: 100%;
      left: 0;
      top: 0;
      cursor: pointer;
      pointer-events: none;

      &.expanded {
        background: rgba($privateAnnotation, 0.65);
        border-top: none;
        border-bottom: 3px dashed $privateAnnotation;
        pointer-events: all;
      }

      .plus {
        position: absolute;
        top: 25%;
        left: 0;
        width: 100%;
        opacity: 0;
        text-align: center;
        z-index: $viewerPageNumZ;

        &.expanded {
          opacity: 1;
          top: 0;
        }

        div {
          background: white;
          border: solid 2px $privateAnnotation;
          box-sizing: border-box;
          font-size: 90%;
          font-weight: bold;
          display: inline-block;
          padding: 2px 5px;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.12);
        }
      }
    }
  }
</style>

<div
  class="container"
  style={expanded
    ? `margin-top: ${-EXPANDED_MARGIN * scale}px; height: ${
        EXPANDED_MARGIN * scale
      }px`
    : `margin-top: ${-UNEXPANDED_MARGIN * scale}px; height: ${
        (RETRACTED_HEIGHT + UNEXPANDED_MARGIN) * scale
      }px`}
  on:mouseover={expand}
  on:focus={expand}
  on:mouseleave={retract}
  on:mousedown={() => startPageNote(pageNumber - 1)}
>
  <div
    class="padder"
    style="padding-top: {(expanded
      ? -RETRACTED_HEIGHT + EXPANDED_MARGIN
      : -RETRACTED_HEIGHT + UNEXPANDED_MARGIN) * scale}px"
  >
    <div
      class="insert"
      class:expanded
      style={expanded
        ? `height: ${EXPANDED_MARGIN * scale}px`
        : `height: ${RETRACTED_HEIGHT * scale}px`}
    >
      <div
        class="plus"
        class:expanded={expanded && scale > 0.65}
        style="height: {PLUS_SIZE * scale}px; line-height: {PLUS_SIZE *
          scale}px;
        border-radius: {BORDER_SIZE *
          scale}px; margin-top: {(-PLUS_SIZE * scale) / 2}px"
      >
        <div>
          {$_("annotation.addPageNote")} ({$_("document.pageAbbrev")}
          {pageNumber})
        </div>
      </div>
    </div>
  </div>
</div>
