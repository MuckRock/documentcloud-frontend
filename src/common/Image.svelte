<script>
  /**
   * A component that retrieves an image. If the image does not
   * exist, continually retries at periodic intervals.
   */

  import { onMount, onDestroy } from "svelte";
  import { layout } from "@/viewer/layout";
  import { ensureBounds } from "@/util/bounds";
  import emitter from "@/emit";

  // The image source
  export let src;
  export let alt = "";
  export let fade = true;
  export let aspect = null;
  export let poll = false;
  export let pollTime = 5000;
  export let delay = null;
  export let crosshair = false;
  export let showLoading = false;

  const emit = emitter({
    aspect() {},

    // Dragging
    dragStart() {},
    dragMove() {},
    dragEnd() {}
  });

  let makeNull = false;
  let show = false;
  let img;
  let foundDimensions = false;
  let ready = false;

  $: computedSrc = makeNull
    ? 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
    : src;

  function handleError() {
    if (makeNull) return;
    makeNull = true;
    if (poll) {
      setTimeout(() => {
        makeNull = false;
      }, pollTime);
    }
  }

  function handleLoad() {
    show = true;
    getDimensions();
  }

  function clearPoll() {
    clearInterval(pollInterval);
    pollInterval = null;
  }

  function getDimensions() {
    if (makeNull || foundDimensions) return;
    if (img != null && img.naturalWidth != null && img.naturalWidth != 0) {
      if (pollInterval != null) {
        clearPoll();
      }
      foundDimensions = true;
      emit.aspect(img.naturalHeight / img.naturalWidth);
    }
  }

  let mousedown = false;

  function normalize(x, y) {
    x = ensureBounds(x, 0, img.offsetWidth);
    y = ensureBounds(y, 0, img.offsetHeight);
    return {
      x: x / img.offsetWidth,
      y: y / img.offsetHeight
    };
  }

  function getXY(e, client = false, changedTouches = false) {
    const touchAccessor = changedTouches ? "changedTouches" : "touches";
    if (e[touchAccessor] != null) {
      if (e[touchAccessor].length != 1) return null;
      const touch = e[touchAccessor][0];
      const { left, top } = img.getBoundingClientRect();
      const x = touch.clientX - left;
      const y = touch.clientY - top;
      return { x, y };
    } else {
      if (client) {
        const { left, top } = img.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        return { x, y };
      } else {
        return { x: e.offsetX, y: e.offsetY };
      }
    }
  }

  function handleMouseDown(e) {
    const data = getXY(e);
    if (data == null) return;
    const { x, y } = data;
    mousedown = true;
    emit.dragStart(normalize(x, y));
  }

  function handleMouseMove(e) {
    if (!mousedown) return;

    const data = getXY(e, true);
    if (data == null) return;

    const { x, y } = data;
    emit.dragMove(normalize(x, y));
  }

  function handleMouseUp(e) {
    if (!mousedown) return;

    mousedown = false;

    const data = getXY(e, true, true);
    if (data == null) return;
    const { x, y } = data;
    emit.dragEnd(normalize(x, y));
  }

  let pollInterval = null;
  onMount(() => {
    pollInterval = setInterval(getDimensions, 300);
    if (delay != null) setTimeout(() => (ready = true), delay);
  });

  onDestroy(() => {
    clearPoll();
  });
</script>

<style lang="scss">
  span {
    display: inline-block;
    background: white;

    &.crosshair {
      cursor: crosshair;
    }

    &.nomove {
      touch-action: pinch-zoom;
    }

    &.aspect {
      width: 100%;
      position: relative;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        pointer-events: none;

        // Fix blurry image bug
        // https://stackoverflow.com/a/36787557
        -webkit-backface-visibility: hidden;
        transform: translateZ(0);
      }
    }
  }

  img {
    user-select: none;

    &.fade {
      opacity: 0;
      filter: blur(3px);
      transition: opacity 1s ease, filter 0.5s ease;
    }

    &.show {
      opacity: 1;
      filter: blur(0);
    }
  }

  .loading {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 12px;
    z-index: 1;
    text-align: right;
    padding: 7px;
    color: gray;
  }
</style>

<span
  class:aspect={aspect != null}
  class:crosshair
  class:nomove={$layout.nomove}
  style={aspect != null ? `padding-top: ${100 * aspect}%` : ''}
  on:mousedown={handleMouseDown}
  on:touchstart={handleMouseDown}>
  {#if delay == null || ready}
    <img
      on:load={handleLoad}
      class:fade
      class:show
      on:error={handleError}
      bind:this={img}
      src={computedSrc}
      {alt}
      draggable="false" />
  {/if}
  {#if showLoading && (!show || makeNull)}
    <div class="loading">
      {#if makeNull}
        An error occurred. Try refreshing the page
      {:else}Loading...{/if}
    </div>
  {/if}
</span>

<svelte:window
  on:mouseup={handleMouseUp}
  on:touchend={handleMouseUp}
  on:mousemove={handleMouseMove}
  on:touchmove={handleMouseMove} />
