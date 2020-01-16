<script>
  // Components
  import Image from "@/common/Image";

  import { renderer, setAspect } from "@/viewer/renderer";
  import { pageImageUrl } from "@/api/viewer";
  import emitter from "@/emit";

  const emit = emitter({
    shift() {}
  });

  export let document;
  export let pageNumber;
  export let aspect;

  $: readablePageNumber = pageNumber + 1;

  function handleAspect(e) {
    const shift = setAspect(pageNumber, e.detail);
    if (shift != 0) {
      emit.shift(shift);
    }
  }
</script>

<style lang="scss">
  .number {
    position: sticky;
    top: 0;
    padding: 21px 0 0 0;
    float: left;
    margin-left: -$pageRail;
    width: $pageRail;
    font-weight: bold;
    font-size: 12px;
    color: #313131;
    user-select: none;

    &:before {
      content: "";
      position: absolute;
      background: linear-gradient(
        180deg,
        rgba($viewerBodyBg, 0),
        $viewerBodyBg 70%
      );
      top: -59px;
      height: 49px;
      width: 100%;
      left: 0;
    }
  }

  .page {
    text-align: center;
    box-sizing: border-box;
    font-size: 0px;
    letter-spacing: 0px;
    word-spacing: 0px;

    :global(img) {
      border: 1 solid #b0b0b0;
      box-sizing: border-box;
      box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.25);
    }
  }
</style>

<div style="padding: {$renderer.verticalPageMargin}px 0">
  <div
    class="page"
    style="width: {$renderer.fullPageWidth}px; padding: 0 {$renderer.pageRail}px;
    margin: 0 auto">
    <div class="number">p. {readablePageNumber}</div>
    <Image
      src={pageImageUrl(document, pageNumber)}
      {aspect}
      fade={false}
      on:aspect={handleAspect}
      alt="Page {readablePageNumber} of {document.title} contributed by {document.userName}" />
  </div>
</div>
