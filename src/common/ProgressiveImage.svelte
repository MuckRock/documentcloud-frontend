<script>
  import { onMount, onDestroy } from "svelte";

  export let alt;
  export let srcs;
  let destroyed = false;
  let elem;
  let img = null;
  let currentSrc = 0;

  $: src = srcs[currentSrc];
  $: highestRes = currentSrc == srcs.length;

  function setElement(newImg, oldImage) {
    if (oldImage == null) {
      elem.appendChild(newImg);
    } else {
      elem.replaceChild(newImg, oldImage);
    }
  }

  function setSrc() {
    const oldImage = img;
    img = new Image();
    img.onload = () => {
      if (!destroyed) {
        setElement(img, oldImage);
        if (!highestRes) {
          currentSrc++;
          setSrc();
        }
      }
    };
    img.alt = alt;
    img.src = src;
    if (oldImage == null) setElement(img, oldImage);
  }

  onMount(() => {
    setSrc();
  });

  onDestroy(() => {
    console.log("destroying");
    destroyed = true;
    if (img != null) img.src = "";
  });
</script>

<span bind:this={elem} />
