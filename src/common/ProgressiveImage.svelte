<script>
  import { onMount, onDestroy } from "svelte";
  import { pageImageUrl } from "@/api/viewer";

  export let alt;
  export let page;
  export let width;
  let elem;
  let destroyed = false;
  let imgs = [];
  let loading = {};
  let largestLoaded = -1;

  const IMAGE_WIDTHS = process.env.IMAGE_WIDTHS.split(",")
    .map(x => x.split(":"))
    .map(x => [parseFloat(x[1]), x[0]])
    .sort((a, b) => a[0] - b[0]);
  const NORMAL_WIDTH = IMAGE_WIDTHS.map((x, i) => [x, i]).filter(
    x => x[0][1] == "normal"
  )[0];
  let srcs = [];

  onMount(() => {
    loadImg(0);
  });

  $: {
    const effectiveWidth = width * (window.devicePixelRatio || 1);
    if (effectiveWidth > NORMAL_WIDTH[0][0]) {
      loadImg(NORMAL_WIDTH[1]);
    }

    let loaded = false;
    for (let i = 0; i < IMAGE_WIDTHS.length; i++) {
      if (effectiveWidth < IMAGE_WIDTHS[i][0]) {
        loadImg(i);
        loaded = true;
        break;
      }
    }
    if (!loaded) loadImg(IMAGE_WIDTHS.length - 1);
  }

  function nixOlder(keepIndex) {
    imgs
      .filter(x => x[1] < keepIndex)
      .forEach(x => {
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
  }

  function loadImg(i) {
    // If image is already being loaded, abort
    if (i < largestLoaded) return;
    if (loading[i]) return;
    loading[i] = true;

    const src = pageImageUrl(
      page.document,
      page.pageNumber,
      IMAGE_WIDTHS[i][0]
    );
    const img = new Image();
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
    return img;
  }

  onDestroy(() => {
    destroyed = true;
    imgs.forEach(img => (img[0].src = ""));
  });
</script>

<style lang="scss">
  span {
    :global(img) {
      width: 100%;
      height: 100%;
      position: absolute;
      transition: opacity 0.2s linear;
      opacity: 0;

      &.loaded {
        opacity: 1;
      }
    }
  }
</style>

<span bind:this={elem} />
