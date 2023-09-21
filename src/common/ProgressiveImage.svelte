<script>
  import { onMount, onDestroy } from "svelte";
  import { pageImageUrl } from "@/api/viewer.js";
  import { timeout } from "@/util/timeout.js";
  import emitter from "@/emit.js";

  const emit = emitter({
    load() {},
  });

  export let alt;
  export let page;
  export let width;
  export let aspect;
  export let bordered = true;
  export let grayed = false;
  export let crosshair = false;
  export let transform = null;
  export let delay = 0;
  let elem;
  let destroyed = false;
  let imgs = [];
  let loading = {};
  let largestLoaded = -1;

  const IMAGE_WIDTHS = process.env.IMAGE_WIDTHS.split(",")
    .map((x) => x.split(":"))
    .map((x) => [parseFloat(x[1]), x[0]])
    .sort((a, b) => a[0] - b[0]);
  const NORMAL_WIDTH = IMAGE_WIDTHS.map((x, i) => [x, i]).filter(
    (x) => x[0][1] == "normal",
  )[0];
  let mounted = false;

  onMount(async () => {
    if (delay != 0) {
      await timeout(delay);
    }
    if (!destroyed) {
      loadImg(0);
      mounted = true;
    }
  });

  // not all browsers support navigator connection
  const slowConn = navigator.connection
    ? navigator.connection.downlink < 10
    : false;

  $: {
    if (mounted) {
      const effectiveWidth = width * (window.devicePixelRatio || 1);
      if (effectiveWidth > NORMAL_WIDTH[0][0] && !slowConn) {
        loadImg(NORMAL_WIDTH[1]);
      }

      let loaded = false;
      for (let i = 0; i < IMAGE_WIDTHS.length; i++) {
        if (
          effectiveWidth < IMAGE_WIDTHS[i][0] ||
          (slowConn && IMAGE_WIDTHS[i][0] == NORMAL_WIDTH[0][0])
        ) {
          loadImg(i);
          loaded = true;
          break;
        }
      }
      if (!loaded) loadImg(IMAGE_WIDTHS.length - 1);
    }
  }

  function nixOlder(keepIndex) {
    imgs
      .filter((x) => x[1] < keepIndex)
      .forEach((x) => {
        x[0].src = "";
        x[0].remove();
      });
  }

  function handleLoad(img, i) {
    // If a higher res image has already been loaded, abort
    if (i < largestLoaded) return;
    elem.appendChild(img);
    imgs.push([img, i]);
    if (largestLoaded == -1) {
      // Fade in immediately
      img.style.opacity = 1;
    } else {
      // Fade in smoothly
      img.addEventListener("transitionend", () => {
        nixOlder(i);
      });
      setTimeout(() => (img.className = "loaded"), 100);
    }
    largestLoaded = i;
    setTimeout(() => emit.load(), 100);
  }

  function loadImg(i) {
    // If image is already being loaded, abort
    if (destroyed) return;
    if (i < largestLoaded) return;
    if (loading[i]) return;
    loading[i] = true;

    const src = pageImageUrl(
      page.document,
      page.pageNumber,
      IMAGE_WIDTHS[i][0],
    );
    const img = new Image();
    // Adapted from comments on https://stackoverflow.com/a/12906840
    img.ondragstart = () => false;
    img.onload = () => {
      if (!destroyed) {
        handleLoad(img, i);
      }
    };
    img.onerror = () => {
      // On error, load previous res
      if (i > 0) loadImg(i - 1);
    };
    img.alt = alt;
    img.src = src;
    if (transform != null) {
      img.style.transformOrigin = "left top";
      img.style.transform = transform;
    }
    return img;
  }

  onDestroy(() => {
    destroyed = true;
    imgs.forEach((img) => (img[0].src = ""));
  });
</script>

<style lang="scss">
  div {
    position: relative;
    width: 100%;
    background: white;
    box-sizing: border-box;
  }
  div.bordered {
    border: solid 1px gainsboro;
  }

  div :global(img) {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;

    user-drag: none;
    user-select: none;

    transition: opacity 0.2s linear;
    opacity: 0;
  }

  div :global(img.loaded) {
    opacity: 1;
  }

  div :global(img.loaded.grayed) {
    filter: brightness(0.8);
  }

  div :global(img.loaded.crosshair) {
    cursor: crosshair;
  }
</style>

<div
  style="padding-top: {aspect * 100}%"
  bind:this={elem}
  class:bordered
  class:grayed
  class:crosshair
/>
