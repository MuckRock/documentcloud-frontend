<script>
  import { onMount, onDestroy } from "svelte";

  export let alt;
  export let srcs;
  let destroyed = false;
  let elem = null;
  let elems = [];
  let img = null;
  let currentSrc = 0;

  let displayedImg = null;
  let displayedIndex = -1;
  let imgs = [];

  function nixOlder(idx) {
    for (let i = 0; i < Math.min(idx, imgs.length); i++) {
      imgs[i].src = "";
    }
  }

  function handleLoad(img, i) {
    elem.appendChild(img);
    displayedImg = img;
    displayedIndex = i;
    setTimeout(() => (img.className = "loaded"), 100);
  }

  // Load all images simultaneously
  $: imgs = srcs.map((src, i) => {
    const img = new Image();
    img.onload = () => {
      if (!destroyed) {
        handleLoad(img, i);
      }
    };
    img.alt = alt;
    img.src = src;
    img.style.zIndex = i + 1;
    return img;
  });

  onDestroy(() => {
    destroyed = true;
    imgs.forEach(img => (img.src = ""));
  });
</script>

<style lang="scss">
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
</style>

<span bind:this={elem} />
