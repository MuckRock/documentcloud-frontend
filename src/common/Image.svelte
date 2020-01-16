<script>
  /**
   * A component that retrieves an image. If the image does not
   * exist, continually retries at periodic intervals.
   */

  import { onMount, onDestroy } from "svelte";
  import emitter from "@/emit";

  // The image source
  export let src;
  export let alt = "";
  export let fade = true;
  export let aspect = null;
  export let poll = false;
  export let pollTime = 5000;

  const emit = emitter({
    aspect() {}
  });

  let makeNull = false;
  let show = false;
  let img;
  let foundDimensions = false;

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

  let pollInterval = null;
  onMount(() => {
    pollInterval = setInterval(getDimensions, 300);
  });

  onDestroy(() => {
    console.log("destroy");
    clearPoll();
  });
</script>

<style lang="scss">
  span {
    display: inline-block;
    background: white;

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
  style={aspect != null ? `padding-top: ${100 * aspect}%` : ''}>
  <img
    on:load={handleLoad}
    class:fade
    class:show
    on:error={handleError}
    bind:this={img}
    src={computedSrc}
    {alt}
    draggable="false" />
</span>
