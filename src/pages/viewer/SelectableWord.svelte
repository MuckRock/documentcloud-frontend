<script>
  import { onMount } from "svelte";

  export let word;
  export let x1;
  export let x2;
  export let y1;
  export let y2;
  export let scale;
  export let appendSpace = false;
  export let highlight = false;

  let span = null;
  let sizer = null;

  $: left = Math.min(x1, x2);
  // $: right = Math.max(x1, x2);
  $: top = Math.min(y1, y2);
  // $: bottom = Math.max(y1, y2);
  $: width = Math.abs(x2 - x1);
  $: height = Math.abs(y2 - y1);

  let transform = "";
  let sizeNeeded = true;

  const SPACE_PERCENT = 0.3;

  onMount(() => {
    sizer.textContent = word;
    const bbox = sizer.getBoundingClientRect();
    const spanBbox = span.getBoundingClientRect();
    const scaleX = spanBbox.width / bbox.width;
    const scaleY = spanBbox.height / bbox.height;
    transform = `scale(${scaleX},${scaleY})`;
    sizeNeeded = false;
  });
</script>

<style lang="scss">
  .selectabletext {
    position: absolute;
    color: transparent;
    user-select: text;
    display: inline-block;
    transform-origin: left top;
    white-space: pre;
    font-family: monospace;

    &::selection {
      background: rgba(66, 147, 240, 0.3);
      mix-blend-mode: multiply;
    }

    &.padded {
      padding-right: 100%;
      padding-bottom: 100%;
    }

    &.highlight {
      background: #f3e94d52;
      background: linear-gradient(#f3e94d52, #f5dd0152);
      border: 1px solid #f5e800;
      padding: 1px;
      border-radius: 3px;
      box-shadow: 0 0 5px #666;
      box-sizing: border-box;
      mix-blend-mode: darken;
    }
  }
</style>

<!-- <div
  style="position: absolute; user-select: all; left: 0; top: 0; width:{right *
    100}%; height:{bottom * 100}%;"
> -->
{#if sizeNeeded}
  <div
    bind:this={sizer}
    class="selectabletext"
    style="user-select: none; overflow:visible; pointer-events: none;"
  />
{/if}
<span
  bind:this={span}
  class="selectabletext"
  class:padded={!sizeNeeded}
  class:highlight
  style="
    font-size: {scale * 100}%;
    left:{left * 100}%;
    top:{top *
    100}%;
    {sizeNeeded
    ? `width: ${width * 100}%; height:
    ${height * 100}%;`
    : ''}
    transform: {transform};"
  >{word}<span style="font-size: 0"
    >{!sizeNeeded && appendSpace ? " " : ""}</span
  ></span
>
