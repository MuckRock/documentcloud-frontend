<script>
  // Components
  import Image from "@/common/Image";
  import Annotation from "./Annotation";

  import { renderer, setAspect } from "@/viewer/renderer";
  import {
    layout,
    pageDragStart,
    pageDragMove,
    pageDragEnd,
    cancelAnnotation
  } from "@/viewer/layout";
  import { pageImageUrl } from "@/api/viewer";
  import emitter from "@/emit";

  const emit = emitter({
    shift() {}
  });

  export let document;
  export let pageNumber;
  export let aspect;
  export let actionOffset = 0;

  $: readablePageNumber = pageNumber + 1;

  function handleAspect(e) {
    const shift = setAspect(pageNumber, e.detail);
    if (shift != 0) {
      emit.shift(shift);
    }
  }
</script>

<style lang="scss">
  .page {
    text-align: center;
    box-sizing: border-box;
    font-size: 0px;
    letter-spacing: 0px;
    word-spacing: 0px;

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
        background: $viewerBodyBg;
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

    &.grayed {
      .number:before {
        background: $viewerBodyBgDarker;
        background: linear-gradient(
          180deg,
          rgba($viewerBodyBgDarker, 0),
          $viewerBodyBgDarker 70%
        );
      }

      .img {
        filter: brightness(0.8);
      }
    }

    .content {
      position: relative;
    }

    :global(img) {
      border: 1 solid #b0b0b0;
      box-sizing: border-box;
      box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.25);
    }
  }

  .redaction {
    position: absolute;
    background: black;
    pointer-events: none;
  }

  .annotation {
    position: absolute;
    pointer-events: none;
    border: $annotationBorderWidth solid #ffe325;
    margin-left: -$annotationBorderWidth;
    margin-top: -$annotationBorderWidth;
    background: #ffe32533;
    border-radius: $radius;
    box-sizing: content-box;
  }
</style>

<div
  on:mousedown={cancelAnnotation}
  style="padding: {$renderer.verticalPageMargin}px 0">
  <div
    class="page"
    class:grayed={$layout.editAnnotate}
    style="width: {$renderer.fullPageWidth}px; padding: 0 {$renderer.pageRail}px;
    margin: 0 auto">
    <div class="number" style="top: {actionOffset}px">
      p. {readablePageNumber}
    </div>
    <div class="content">
      <!-- Actual page image -->
      <div class="img">
        <Image
          src={pageImageUrl(document, pageNumber)}
          {aspect}
          fade={false}
          crosshair={$layout.pageCrosshair}
          on:aspect={handleAspect}
          on:dragStart={({ detail }) => pageDragStart(pageNumber, detail.x, detail.y)}
          on:dragMove={({ detail }) => pageDragMove(pageNumber, detail.x, detail.y)}
          on:dragEnd={({ detail }) => pageDragEnd(pageNumber, detail.x, detail.y)}
          alt="Page {readablePageNumber} of {document.title} contributed by {document.userName}" />
      </div>
      {#if $layout.redacting}
        <!-- Pending redactions -->
        {#each $layout.allRedactions as redaction}
          {#if redaction.page == pageNumber}
            <div
              class="redaction"
              style="left: {redaction.x1 * 100}%; top: {redaction.y1 * 100}%;
              width: {redaction.width * 100}%; height: {redaction.height * 100}%" />
          {/if}
        {/each}
      {:else if $layout.annotating}
        {#if $layout.currentAnnotation != null && $layout.currentAnnotation.page == pageNumber}
          <div
            class="annotation"
            style="left: {$layout.currentAnnotation.x1 * 100}%; top: {$layout.currentAnnotation.y1 * 100}%;
            width: {$layout.currentAnnotation.width * 100}%; height: {$layout.currentAnnotation.height * 100}%" />
        {/if}
      {:else if $layout.editAnnotate}
        {#if $layout.shownAnnotation != null && $layout.shownAnnotation.page == pageNumber}
          <Annotation
            {document}
            annotation={$layout.shownAnnotation}
            {aspect} />
        {/if}
      {/if}
    </div>
  </div>
</div>
