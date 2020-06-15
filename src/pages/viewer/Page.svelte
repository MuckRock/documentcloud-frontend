<script>
  import ProgressiveImage from "@/common/ProgressiveImage";
  import { pageImageUrl } from "@/api/viewer";
  import { arrayEq } from "@/util/array";
  import { ignoreFirst } from "@/util/closure";
  import { onMount, onDestroy } from "svelte";

  export let page;
  export let width;

  let number;
  let observer = null;
  let numberVisible = true;

  onMount(() => {
    // Use an intersection observer to hide the number when it's only partially visible
    observer = new IntersectionObserver(
      ignoreFirst(e => {
        if (e == null || e.length != 1) return;
        numberVisible =
          e[0].intersectionRatio == 1 ||
          e[0].intersectionRect.width >= e[0].boundingClientRect.width;
      }),
      {
        threshold: 1,
        margin: "30px 0 30px 0"
      }
    );
    observer.observe(number);
  });

  onDestroy(() => {
    if (observer != null) {
      observer.unobserve(number);
    }
  });
</script>

<style lang="scss">
  .numbercontainer {
    position: absolute;
    top: 0;
    height: 100%;

    .number {
      position: sticky;
      text-align: right;
      box-sizing: border-box;
      padding: 12px 20px 12px 0;
      font-weight: bold;
      font-size: 12px;
      white-space: pre;
      top: 20px;
    }
  }

  .page {
    width: 100%;
    height: 100%;
    background: white;
    border: solid 1px gainsboro;
    box-sizing: border-box;
  }
</style>

<div class="numbercontainer" style="right: {width}px;">
  <div
    class="number"
    bind:this={number}
    style="visibility: {numberVisible ? 'visible' : 'hidden'}">
    p. {page.pageNumber + 1}
  </div>
</div>
<div class="page">
  <ProgressiveImage
    alt="Page {page.pageNumber + 1} of {page.document.title}"
    {width}
    {page} />
</div>
