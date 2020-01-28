<script>
  /**
   * A component that retrieves an image. If the image does not
   * exist, continually retries at periodic intervals.
   */

  import { onMount, onDestroy } from "svelte";
  import { ensureBounds } from "@/util/bounds";
  import emitter from "@/emit";

  // The image source
  export let src;
  export let alt = "";
  export let fade = true;
  export let aspect = null;
  export let poll = false;
  export let pollTime = 5000;
  export let wait = null;
  export let crosshair = false;

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
    if (foundDimensions) return;
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

  function handleMouseDown(e) {
    mousedown = true;
    const x = e.offsetX;
    const y = e.offsetY;
    emit.dragStart(normalize(x, y));
  }

  function handleMouseMove(e) {
    if (!mousedown) return;
    const { left, top } = img.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    emit.dragMove(normalize(x, y));
  }

  function handleMouseUp(e) {
    if (!mousedown) return;
    mousedown = false;
    const { left, top } = img.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    emit.dragEnd(normalize(x, y));
  }

  let pollInterval = null;
  onMount(() => {
    pollInterval = setInterval(getDimensions, 300);
    if (wait != null) setTimeout(() => (ready = true), wait);
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
</style>

<span
  class:aspect={aspect != null}
  class:crosshair
  style={aspect != null ? `padding-top: ${100 * aspect}%` : ''}
  on:mousedown={handleMouseDown}>
  {#if wait == null || ready}
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
</span>

<svelte:window on:mouseup={handleMouseUp} on:mousemove={handleMouseMove} />
