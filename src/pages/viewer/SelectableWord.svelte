<script>
  import { onMount } from "svelte";

  export let word;
  export let x1;
  export let x2;
  export let y1;
  export let y2;
  export let scale;

  let elem = null;
  let span = null;
  let sizer = null;

  $: left = Math.min(x1, x2);
  // $: right = Math.max(x1, x2);
  $: top = Math.min(y1, y2);
  // $: bottom = Math.max(y1, y2);
  $: width = Math.abs(x2 - x1);
  $: height = Math.abs(y2 - y1);

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
