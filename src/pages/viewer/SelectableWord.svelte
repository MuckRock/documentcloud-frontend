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
  export let direction = "left";
  export let pageWidth;
  export let pageHeight;

  let isResizing = false;
  let resizeTimeout = null;
  const RESIZE_DELAY = 50;

  function setResizeTimer() {
    isResizing = true;
    if (resizeTimeout != null) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeTimeout = null;
      isResizing = false;
    }, RESIZE_DELAY);
  }

  $: {
    // Every time scale changes because page is transforming,
    // hide text for a small amount of time
    setResizeTimer(scale);
  }

  let span = null;
  let sizer = null;

  $: left = Math.min(x1, x2);
  $: top = Math.min(y1, y2);
  $: width = Math.abs(x2 - x1);
  $: height = Math.abs(y2 - y1);

  let transform = "";
  let sizeNeeded = true;

  let scaleX = 1;
  let scaleY = 1;
  let exactWidth = null;
  let exactHeight = null;

  const highlightPaddingX = 2;
  const highlightPaddingY = 1;

  onMount(() => {
    sizer.textContent = word;
    const bbox = sizer.getBoundingClientRect();
    const spanBbox = span.getBoundingClientRect();
    scaleX = spanBbox.width / bbox.width / scale;
    scaleY = spanBbox.height / bbox.height / scale;
    exactWidth = spanBbox.width / scale;
    exactHeight = spanBbox.height / scale;
    transform = `scale(${scaleX},${scaleY})`;
    sizeNeeded = false;
  });
</script>

{#if sizeNeeded}
  <div
    bind:this={sizer}
    class="selectabletext"
    style="user-select: none; overflow:visible; pointer-events: none;"
  />
{/if}
<span
  bind:this={span}
  class="selectabletext {direction}"
  class:resizing={isResizing && !sizeNeeded}
  style="
    left:{left * 100}%;
    top:{top * 100}%;
    {sizeNeeded
    ? `width: ${width * 100}%; height:
    ${height * 100}%;`
    : ''}
    transform: {transform}{!sizeNeeded && direction == 'right'
    ? ` translate(${-pageWidth / scaleX}px,0)`
    : ''};
    {!sizeNeeded ? `padding-bottom: ${pageHeight / scaleY}px;` : ''}
    {!sizeNeeded && direction == 'left'
    ? `padding-right: ${pageWidth / scaleX}px;`
    : ''}
    {!sizeNeeded && direction == 'right'
    ? `padding-left: ${pageWidth / scaleX}px;`
    : ''}
    "
  >{word}<span style="font-size: 0"
    >{!sizeNeeded && appendSpace ? " " : ""}</span
  ></span
>
{#if highlight && exactWidth != null && exactHeight != null}
  <span
    class="highlight"
    class:resizing={isResizing && !sizeNeeded}
    style="
    left:calc({left * 100}% - {highlightPaddingX * scale}px);
    top:calc({top * 100}% - {highlightPaddingY * scale}px);
    width:{(exactWidth + highlightPaddingX * 2) *
      scale}px;height:{(exactHeight + highlightPaddingY * 2) * scale}px;
    "
  />
{/if}

<style>
  .selectabletext {
    position: absolute;
    color: transparent;
    user-select: text;
    display: inline-block;
    transform-origin: left top;
    white-space: pre;
    font-family: monospace;
  }

  .selectabletext::selection {
    background: rgba(66, 147, 240, 0.3);
    mix-blend-mode: multiply;
  }

  .highlight {
    position: absolute;
    pointer-events: none;
    background: #f3e94d52;
    background: linear-gradient(#f3e94d52, #f5dd0152);
    border: 1px solid #f5e800;
    padding: 1px;
    border-radius: 3px;
    box-shadow: 0 0 5px #666;
    box-sizing: border-box;
    mix-blend-mode: darken;
  }

  .resizing {
    display: none;
  }
</style>
