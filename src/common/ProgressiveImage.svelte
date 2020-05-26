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
    if (displayedImg == null) {
      elem.appendChild(img);
      displayedImg = img;
      displayedIndex = i;
      nixOlder(i);
    } else {
      if (i > displayedIndex) {
        elem.replaceChild(img, displayedImg);
        displayedImg = img;
        displayedIndex = i;
        nixOlder(i);
      }
    }
  }

  onMount(() => {
    // Load all images simultaneously
    imgs = srcs.map((src, i) => {
      const img = new Image();
      img.onload = () => {
        if (!destroyed) {
          handleLoad(img, i);
        }
      };
      img.alt = alt;
      img.src = src;
      return img;
    });
  });

  onDestroy(() => {
    destroyed = true;
    imgs.forEach(img => (img.src = ""));
  });
</script>

<span bind:this={elem} />
