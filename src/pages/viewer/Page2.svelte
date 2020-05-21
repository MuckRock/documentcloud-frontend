<script>
  // Components
  import Image from "@/common/Image";
  import TextPage from "@/common/TextPage";
  import VariableChunk from "@/common/VariableChunk";
  import Annotation from "./Annotation";

  import { renderer, setAspect, showAnnotation } from "@/viewer/renderer";
  import { viewer } from "@/viewer/viewer";
  import {
    layout,
    pageDragStart,
    pageDragMove,
    pageDragEnd,
    cancelAnnotation
  } from "@/viewer/layout";
  import { hoveredNote } from "@/viewer/hoveredNote";
  import { pageImageUrl, textUrl } from "@/api/viewer";
  import emitter from "@/emit";
  import { onMount, onDestroy } from "svelte";

  // SVG assets
  import publicTagSvg from "@/assets/public_tag.svg";
  import organizationTagSvg from "@/assets/organization_tag.svg";
  import privateTagSvg from "@/assets/private_tag.svg";

  const svgMap = {
    public: publicTagSvg,
    organization: organizationTagSvg,
    private: privateTagSvg
  };

  const emit = emitter({
    shift() {}
  });

  export let document;
  export let pageNumber;
  export let aspect;
  export let actionOffset = 0;

  let chosenNote = null;
  let additionalAspect = 0;
  let newAspect = aspect;

  let showPageNoteInsert = false;

  $: readablePageNumber = pageNumber + 1;

  function handleAspect(e) {
    newAspect = e.detail;
  }

  $: {
    const shift = setAspect(pageNumber, newAspect + additionalAspect);
    if (shift != 0) {
      emit.shift(shift);
    }
  }

  let visualScale = 1;

  function viewportHandler() {
    visualScale = window.visualViewport.scale;
  }

  onMount(() => {
    if (window.visualViewport != null) {
      window.visualViewport.addEventListener("resize", viewportHandler);
    }
  });

  onDestroy(() => {
    if (window.visualViewport != null) {
      window.visualViewport.removeEventListener("resize", viewportHandler);
    }
  });
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
      font-weight: bold;
      font-size: 12px;
      color: #313131;
      user-select: none;
      z-index: $viewerPageNumZ;

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

      :global(img),
      :global(.text) {
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.07);
      }
    }
  }

  .redaction {
    position: absolute;
    background: black;
    pointer-events: none;
  }

  .tag {
    @include buttonLike;

    position: absolute;
    left: -35px;
    opacity: 0.5;
    z-index: $viewerTagZ;

    &:hover,
    &.hover {
      opacity: 0.8;
    }

    &.grayed {
      pointer-events: none;
      visibility: hidden;
    }
  }

  .annotation {
    position: absolute;
    pointer-events: none;
    margin-left: -$annotationBorderWidth;
    margin-top: -$annotationBorderWidth;
    border-radius: $radius;
    box-sizing: content-box;

    &.selectable {
      cursor: pointer;
      pointer-events: all;

      &:hover,
      &.hover {
        box-shadow: 1px 2px 7px rgba(0, 0, 0, 0.2);
      }
    }

    &.public {
      border: $annotationBorderWidth solid $annotationBorder;
      background: rgba($annotationBorder, 0.2);
    }

    &.organization {
      border: $annotationBorderWidth solid $organizationAnnotation;
      background: rgba($organizationAnnotation, 0.2);
    }

    &.private {
      border: $annotationBorderWidth solid $privateAnnotation;
      background: rgba($privateAnnotation, 0.2);
    }

    &.grayed {
      pointer-events: none;
      visibility: hidden;
    }
  }
</style>

<div
  on:mousedown={cancelAnnotation}
  style="padding: {$renderer.verticalPageMargin}px 0;">
  <div
    class="page"
    class:grayed={$layout.displayAnnotate}
    style="width: {$renderer.fullPageWidth}px; padding: 0 {$renderer.pageRail}px;
    margin: 0 auto">
    {#if $renderer.showRail}
      <div
        class="number"
        style="top: {actionOffset}px; margin-left: {-$renderer.pageRail}px;
        width: {$renderer.pageRail}px;">
        p. {readablePageNumber}
      </div>
    {/if}
    <div class="content">
      <!-- Actual page image -->
      <div class="img">
        {#if $renderer.mode == 'image'}
          <Image
            src={pageImageUrl(document, pageNumber, $renderer.width, visualScale)}
            aspect={aspect - additionalAspect}
            fade={false}
            delay={50}
            crosshair={$layout.pageCrosshair}
            showLoading={true}
            on:aspect={handleAspect}
            on:dragStart={({ detail }) => pageDragStart(pageNumber, detail.x, detail.y)}
            on:dragMove={({ detail }) => pageDragMove(pageNumber, detail.x, detail.y)}
            on:dragEnd={({ detail }) => pageDragEnd(pageNumber, detail.x, detail.y)}
            alt="Page {readablePageNumber} of {document.title} contributed by {document.userName}" />
        {:else if $renderer.mode == 'text'}
          <TextPage
            src={textUrl(document, pageNumber)}
            width={$renderer.width}
            highlights={$layout.searchHighlights != null ? $layout.searchHighlights[pageNumber] : null}
            delay={50}
            {aspect}
            on:aspect={handleAspect} />
        {/if}
      </div>
      {#if $renderer.mode == 'image'}
        <!-- Only show annotations and redactions in image mode -->
        {#if $viewer.notesByPage[pageNumber] != null}
          <!-- Existing annotations -->
          {#each $viewer.notesByPage[pageNumber] as note}
            <div
              class="tag"
              class:hover={$layout.hoveredNote == note}
              class:grayed={$layout.displayAnnotate}
              use:hoveredNote={note}
              on:click={() => showAnnotation(note)}
              style="top: {note.y1 * 100}%">
              {@html svgMap[note.access]}
            </div>
            <div
              class="annotation selectable"
              class:public={note.access == 'public'}
              class:organization={note.access == 'organization'}
              class:private={note.access == 'private'}
              class:grayed={$layout.displayAnnotate}
              class:hover={$layout.hoveredNote == note}
              use:hoveredNote={note}
              on:click={() => showAnnotation(note)}
              style="left: {note.x1 * 100}%; top: {note.y1 * 100}%; width: {(note.x2 - note.x1) * 100}%;
              height: {(note.y2 - note.y1) * 100}%" />
          {/each}
        {/if}
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
              class:public={$layout.currentAnnotation.access == 'public'}
              class:organization={$layout.currentAnnotation.access == 'organization'}
              class:private={$layout.currentAnnotation.access == 'private'}
              style="left: {$layout.currentAnnotation.x1 * 100}%; top: {$layout.currentAnnotation.y1 * 100}%;
              width: {$layout.currentAnnotation.width * 100}%; height: {$layout.currentAnnotation.height * 100}%" />
          {/if}
        {:else if $layout.displayAnnotate}
          {#if $layout.displayedAnnotation != null && $layout.displayedAnnotation.page == pageNumber}
            <Annotation
              {document}
              annotation={$layout.displayedAnnotation}
              mode={$layout.annotateMode}
              {aspect} />
          {/if}
        {/if}
      {/if}
    </div>
  </div>
</div>
