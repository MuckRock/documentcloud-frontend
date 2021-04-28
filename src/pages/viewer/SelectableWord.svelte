<script>
  import { onMount } from "svelte";

  export let word;
  export let x0;
  export let x1;
  export let y0;
  export let y1;
  export let scale;

  let elem = null;
  let span = null;
  let sizer = null;

  $: left = Math.min(x0, x1);
  $: right = Math.max(x0, x1);
  $: top = Math.min(y0, y1);
  $: bottom = Math.max(y0, y1);
  $: width = Math.abs(x1 - x0);
  $: height = Math.abs(y1 - y0);

  let transform = "";

  onMount(() => {
    const bbox = sizer.getBoundingClientRect();
    const spanBbox = span.getBoundingClientRect();
    transform = `scale(${bbox.width / spanBbox.width},${
      bbox.height / spanBbox.height
    })`;
  });
</script>

<!-- <div
  style="position: absolute; user-select: all; left: 0; top: 0; width:{right *
    100}%; height:{bottom * 100}%;"
> -->
<div
  bind:this={sizer}
  style="position: absolute; left: 0; top: 0; width: {width *
    100}%; height: {height * 100}%; pointer-events: none;"
/>
<div
  bind:this={elem}
  style="position: absolute;
  font-size: {scale *
    100}%; color: transparent; user-select: all;
  left:{left * 100}%; top:{top *
    100}%; width: {width * 100}%; height: {height *
    100}%; padding-right: 100%; padding-bottom: 100%; overflow: hidden;"
>
  <span
    bind:this={span}
    style="display: inline-block; transform-origin: left top; transform: {transform};"
    >{word}</span
  >
</div>
<!-- </div> -->
