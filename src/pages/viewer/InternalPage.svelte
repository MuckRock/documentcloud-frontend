<script>
  import ExtraPageContent from "./ExtraPageContent";
  import PageNoteInsert from "./PageNoteInsert";
  import ProgressiveImage from "@/common/ProgressiveImage";
  import Annotation from "./Annotation";

  import { pageImageUrl } from "@/api/viewer";
  import { arrayEq } from "@/util/array";
  import { ignoreFirst } from "@/util/closure";
  import { doc, showAnnotation } from "@/viewer/document";
  import { viewer } from "@/viewer/viewer";
  import { layout } from "@/viewer/layout";
  import { markup } from "@/util/markup";
  import { hoveredNote } from "@/viewer/hoveredNote";
  import { onMount, onDestroy } from "svelte";

  export let page;
  export let width;
  export let scale;
  export let resizeCallback;
  export let height;
  export let y;

  // Incrementer to mutate extra page content size when annotation sizes alter
  let annotationChanger = 0;

  // SVG assets
  import publicTagSvg from "@/assets/public_tag.svg";
  import organizationTagSvg from "@/assets/organization_tag.svg";
  import privateTagSvg from "@/assets/private_tag.svg";

  const svgMap = {
    public: publicTagSvg,
    organization: organizationTagSvg,
    private: privateTagSvg
  };

  let number = null;
  let observer = null;
  let numberVisible = true;

  const border = 1;

  // Image height calculated from aspect
  $: effectiveWidth = width - border * 2;
  $: height = (width - border * 2) * page.aspect;

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
    if (observer != null && number != null) {
      observer.unobserve(number);
    }
  });
</script>

<style lang="scss">
  .numbercontainer {
    position: absolute;
    top: 0;
    height: 100%;
    user-select: none;

    .number {
      position: sticky;
      text-align: right;
      box-sizing: border-box;
      padding: 12px 20px 12px 0;
      font-weight: bold;
      font-size: 12px;
      white-space: pre;
      top: 20px;

      &.grayed {
        pointer-events: none;
      }

      a {
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .page {
    width: 100%;
    height: 100%;
    user-select: none;
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

<div class="numbercontainer" style="right: {width}px;">
  <div
    class="number"
    class:grayed={$layout.displayAnnotate}
    bind:this={number}
    style="visibility: {numberVisible ? 'visible' : 'hidden'}">
    <a href="#{page.pageNumber + 1}">p. {page.pageNumber + 1}</a>
  </div>
</div>
<div class="page">
  <ExtraPageContent
    {page}
    {width}
    {resizeCallback}
    mutators={[$viewer.pageNotesByPage[page.pageNumber], $doc.showPageNoteInserts, $layout.displayedAnnotation != null && $layout.displayedAnnotation.page == page.pageNumber && $layout.displayedAnnotation.isPageNote ? $layout.displayedAnnotation : null, annotationChanger]}>
    <div style="font-size: {scale * 100}%">
      <!-- Check for page notes -->
      {#if $layout.pageCrosshair}
        <PageNoteInsert pageNumber={page.pageNumber + 1} {scale} />
      {/if}
      {#if $layout.displayedAnnotation != null && $layout.displayedAnnotation.page == page.pageNumber && $layout.displayedAnnotation.isPageNote}
        <Annotation
          {page}
          pageNote={true}
          annotation={$layout.displayedAnnotation}
          mode={$layout.annotateMode} />
      {/if}
      {#if $viewer.pageNotesByPage[page.pageNumber] != null}
        {#each $viewer.pageNotesByPage[page.pageNumber] as note}
          <Annotation
            on:stateChange={() => annotationChanger++}
            {page}
            pageNote={true}
            annotation={note}
            mode="view" />
        {/each}
      {/if}
    </div>
  </ExtraPageContent>
  <div style="position: relative" use:markup={page.pageNumber}>
    <ProgressiveImage
      alt="Page {page.pageNumber + 1} of {page.document.title}"
      crosshair={$layout.pageCrosshair}
      width={effectiveWidth}
      aspect={page.aspect}
      grayed={$layout.displayAnnotate}
      {page} />

    <!-- Markup -->
    {#if $viewer.notesByPage[page.pageNumber] != null}
      <!-- Existing annotations -->
      {#each $viewer.notesByPage[page.pageNumber] as note}
        {#if !note.isPageNote}
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
        {/if}
      {/each}
    {/if}

    {#if $layout.redacting}
      <!-- Pending redactions -->
      {#each $layout.allRedactions as redaction}
        {#if redaction.page == page.pageNumber}
          <div
            class="redaction"
            style="left: {redaction.x1 * 100}%; top: {redaction.y1 * 100}%;
            width: {redaction.width * 100}%; height: {redaction.height * 100}%" />
        {/if}
      {/each}
    {:else if $layout.annotating}
      {#if $layout.currentAnnotation != null && $layout.currentAnnotation.page == page.pageNumber && !$layout.currentAnnotation.isPageNote}
        <div
          class="annotation"
          class:public={$layout.currentAnnotation.access == 'public'}
          class:organization={$layout.currentAnnotation.access == 'organization'}
          class:private={$layout.currentAnnotation.access == 'private'}
          style="left: {$layout.currentAnnotation.x1 * 100}%; top: {$layout.currentAnnotation.y1 * 100}%;
          width: {$layout.currentAnnotation.width * 100}%; height: {$layout.currentAnnotation.height * 100}%" />
      {/if}
    {:else if $layout.displayAnnotate}
      {#if $layout.displayedAnnotation != null && $layout.displayedAnnotation.page == page.pageNumber && !$layout.displayedAnnotation.isPageNote}
        <Annotation
          {page}
          {y}
          {height}
          width={effectiveWidth}
          annotation={$layout.displayedAnnotation}
          mode={$layout.annotateMode}
          aspect={page.aspect} />
      {/if}
    {/if}
  </div>
</div>
