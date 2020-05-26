<script>
  import ProgressiveImage from "@/common/ProgressiveImage";
  import { pageImageUrl } from "@/api/viewer";

  export let transform;
  export let page;
  export let bodyWidth;

  // Minimum padding of number from top of screen
  const NUMBER_TOP = 20;
  const NUMBER_BOTTOM = 40;
  const NUMBER_LEFT = 10;

  $: railSize = transform.scaleFactor * transform.document.layout.rail;
  $: topLeft = transform.project([page.position[0], page.position[1]]);
  $: bottomRight = transform.project([page.position[2], page.position[3]]);
  $: width = bottomRight[0] - topLeft[0];
  $: height = bottomRight[1] - topLeft[1];

  let numberWidth = 0;
  $: numberRight = bodyWidth - topLeft[0];
  $: numberTop = Math.min(
    Math.max(topLeft[1], NUMBER_TOP),
    bottomRight[1] - NUMBER_BOTTOM
  );
  $: numberLeft = topLeft[0] - numberWidth;

  const WIDTH_BREAKPOINTS = process.env.IMAGE_WIDTHS.split(",")
    .map(x => parseInt(x.split(":")[1]))
    .reverse();

  function breakpointify(initialWidth, breakpoints, fn) {
    const fns = [];
    for (let i = 0; i < WIDTH_BREAKPOINTS.length; i++) {
      const width = WIDTH_BREAKPOINTS[i];
      if (width < initialWidth) {
        fns.push(fn(width));
      } else break;
    }
    if (initialWidth < WIDTH_BREAKPOINTS[WIDTH_BREAKPOINTS.length - 1]) {
      fns.push(fn(initialWidth));
    }
    return fns;
  }

  $: srcs = breakpointify(
    width * window.devicePixelRatio || 1,
    WIDTH_BREAKPOINTS,
    x => pageImageUrl(page.document, page.pageNumber, x)
  );
</script>

<style lang="scss">
  .number {
    position: absolute;
    text-align: right;
    box-sizing: border-box;
    padding: 12px 20px 0 0;
    font-weight: bold;
    font-size: 12px;
    white-space: pre;
  }

  .page {
    position: absolute;
    background: rgb(216, 216, 216);
    border: solid 1px gainsboro;
    box-sizing: border-box;

    :global(img) {
      width: 100%;
      height: 100%;
    }
  }
</style>

{#if transform.viewportWidth > transform.document.containerWidth}
  <div
    class="number"
    bind:clientWidth={numberWidth}
    style="right: {numberRight}px; top: {numberTop}px; visibility: {numberLeft >= NUMBER_LEFT ? 'visible' : 'hidden'}">
    p. {page.pageNumber + 1}
  </div>
{/if}
<div
  class="page"
  style="left: {topLeft[0]}px; top: {topLeft[1]}px; width: {width}px; height: {height}px">
  <ProgressiveImage
    alt="Page {page.pageNumber + 1} of {page.document.title}"
    {srcs} />
</div>
