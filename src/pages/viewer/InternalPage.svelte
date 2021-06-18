<script>
  import ExtraPageContent from "./ExtraPageContent";
  import PageNoteInsert from "./PageNoteInsert";
  import ProgressiveImage from "@/common/ProgressiveImage";
  import Annotation from "./Annotation";

  import { showIfFullyVisible } from "@/util/visibility";
  import { doc, showAnnotation } from "@/viewer/document";
  import { viewer } from "@/viewer/viewer";
  import { layout } from "@/viewer/layout";
  import { markup } from "@/util/markup";
  import { hoveredNote } from "@/viewer/hoveredNote";
  import { selectableTextUrl } from "@/api/viewer";
  import session from "@/api/session";
  import { coalesceSelectableHighlights } from "@/util/coalesceHighlights";
  import { onDestroy, onMount } from "svelte";

  // Selectable text
  import SelectableWord from "./SelectableWord";

  export let page;
  export let width;
  export let scale;
  export let resizeCallback;
  export let height;
  export let y;
  export let callback;

  // Incrementer to mutate extra page content size when annotation sizes alter
  let annotationChanger = 0;

  // SVG assets
  import publicTagSvg from "@/assets/public_tag.svg";
  import organizationTagSvg from "@/assets/organization_tag.svg";
  import privateTagSvg from "@/assets/private_tag.svg";

  const svgMap = {
    public: publicTagSvg,
    organization: organizationTagSvg,
    private: privateTagSvg,
  };

  const border = 1;

  let textPageUpdated = 0; // counter to mutate page height

  // Image height calculated from aspect
  $: effectiveWidth = width - border * 2;
  $: height = (width - border * 2) * page.aspect;

  let selectableText = [];
  let hasSelectableText = false;
  const SELECTABLE_TEXT_DELAY = 50; // small timeout to avoid spamming requests
  let selectableTextTimeout = null;
  let detectedDirection = "left";

  function detectWritingDirection() {
    let ltr = 0;
    let rtl = 0;
    for (let i = 1; i < selectableText.length; i++) {
      const prev = selectableText[i - 1];
      const current = selectableText[i];
      if (current.x1 > prev.x2) {
        // Left-to-right block
        ltr++;
      } else if (current.x2 < prev.x1) {
        // Right-to-left block
        rtl++;
      }
    }
    if (rtl > ltr) {
      return "right";
    }
    return "left";
  }

  onMount(async () => {
    if (callback != null) {
      callback();
      callback = null;
    }

    selectableTextTimeout = setTimeout(async () => {
      selectableTextTimeout = null;
      try {
        // Get selectable text if available
        selectableText = await session.getStatic(
          selectableTextUrl(viewer.document, page.pageNumber),
        );
        detectedDirection = detectWritingDirection();
        hasSelectableText = true;
      } catch (e) {
        // No selectable text, no worries
      }
      if ($layout.searchHighlights != null) {
        // Merge highlights into selectable text
        selectableText = coalesceSelectableHighlights(
          selectableText,
          $layout.searchHighlights[page.pageNumber],
        );
      }
    }, SELECTABLE_TEXT_DELAY);
  });

  onDestroy(() => {
    if (selectableTextTimeout != null) clearTimeout(selectableTextTimeout);
  });

  // Drag detection
  let textMouseDown = false;
  function handleMouseDown() {
    textMouseDown = true;
  }

  function handleMouseUp() {
    textMouseDown = false;
  }

  function handleCopy(e) {
    // Standardize copy text to remove rich text formatting
    const copyText = document.getSelection().toString();
    const clipdata = e.clipboardData || window.clipboardData;
    clipdata.setData("text/plain", copyText);
    clipdata.setData("text/html", copyText);
    e.preventDefault();
  }
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

    &.disabled {
      pointer-events: none;
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

    &.amplified {
      backdrop-filter: brightness(125%);

      &.public {
        background: rgba($annotationBorder, 0.1);
      }

      &.organization {
        background: rgba($organizationAnnotation, 0.1);
      }

      &.private {
        background: rgba($privateAnnotation, 0.1);
      }
    }
  }
</style>

<div class="numbercontainer" style="right: {width}px;">
  <div
    class="number"
    use:showIfFullyVisible
    class:grayed={$layout.displayAnnotate}
  >
    <a href="#document/p{page.pageNumber + 1}">p. {page.pageNumber + 1}</a>
  </div>
</div>
<div class="page">
  <ExtraPageContent
    {page}
    {width}
    {resizeCallback}
    mutators={[
      $viewer.pageNotesByPage[page.pageNumber],
      $doc.showPageNoteInserts,
      $doc.mode,
      $layout.displayAnnotate,
      $layout.displayedAnnotation != null &&
      $layout.displayedAnnotation.page == page.pageNumber &&
      $layout.displayedAnnotation.isPageNote
        ? $layout.displayedAnnotation
        : null,
      annotationChanger,
      textPageUpdated,
    ]}
  >
    <div style="font-size: {scale * 100}%">
      <!-- Check for page notes -->
      {#if $layout.annotating}
        <PageNoteInsert pageNumber={page.pageNumber + 1} {scale} />
      {/if}
      {#if $layout.displayedAnnotation != null && $layout.displayedAnnotation.page == page.pageNumber && $layout.displayedAnnotation.isPageNote}
        <Annotation
          {page}
          grayed={$layout.selectNoteEmbed}
          pageNote={true}
          annotation={$layout.displayedAnnotation}
          mode={$layout.annotateMode}
        />
      {/if}
      {#if $viewer.pageNotesByPage[page.pageNumber] != null}
        {#each $viewer.pageNotesByPage[page.pageNumber] as note}
          <Annotation
            grayed={$layout.displayAnnotate || $layout.selectNoteEmbed}
            on:stateChange={() => annotationChanger++}
            behind={true}
            {page}
            pageNote={true}
            annotation={note}
            mode="view"
          />
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
      grayed={$layout.displayAnnotate || $layout.selectNoteEmbed}
      {page}
    />

    <!-- Selectable text -->
    {#if hasSelectableText}
      <div
        on:mousedown={handleMouseDown}
        on:copy={handleCopy}
        style="position: absolute; pointer-events: {$layout.redacting ||
        $layout.annotating
          ? 'none'
          : 'all'}; left: 0; right: 0; top: 0; bottom: 0; overflow: hidden; user-select: text; cursor: text; direction: {detectedDirection ==
        'left'
          ? 'ltr'
          : 'rtl'}"
      >
        {#each selectableText as word, i}
          <SelectableWord
            word={word.text}
            x1={word.x1}
            x2={word.x2}
            y1={word.y1}
            y2={word.y2}
            pageWidth={width}
            pageHeight={height}
            {scale}
            direction={detectedDirection}
            highlight={word.type == "highlight"}
            appendSpace={i != selectableText.length - 1}
          />
        {/each}
      </div>
    {/if}

    <!-- Markup -->
    {#if $viewer.notesByPage[page.pageNumber] != null}
      <!-- Existing annotations -->
      {#each $viewer.notesByPage[page.pageNumber] as note}
        {#if !note.isPageNote}
          <div
            class="tag"
            class:hover={$layout.hoveredNote == note}
            class:grayed={$layout.displayAnnotate}
            class:disabled={$layout.redacting || textMouseDown}
            use:hoveredNote={note}
            on:click={() => showAnnotation(note)}
            style="top: {note.y1 * 100}%"
          >
            {@html svgMap[note.access]}
          </div>
          <div
            class="annotation"
            class:public={note.access == "public"}
            class:organization={note.access == "organization"}
            class:private={note.access == "private"}
            class:grayed={$layout.displayAnnotate}
            class:amplified={$layout.selectNoteEmbed}
            class:hover={$layout.hoveredNote == note}
            class:selectable={!$layout.redacting && !textMouseDown}
            use:hoveredNote={note}
            on:click={() => showAnnotation(note)}
            style="left: {note.x1 * 100}%; top: {note.y1 *
              100}%; width: {(note.x2 - note.x1) *
              100}%;
            height: {(note.y2 - note.y1) * 100}%"
          />
        {/if}
      {/each}
    {/if}

    {#if $layout.redacting}
      <!-- Pending redactions -->
      {#each $layout.allRedactions as redaction}
        {#if redaction.page == page.pageNumber}
          <div
            class="redaction"
            style="left: {redaction.x1 * 100}%; top: {redaction.y1 *
              100}%;
            width: {redaction.width *
              100}%; height: {redaction.height * 100}%"
          />
        {/if}
      {/each}
    {:else if $layout.annotating}
      {#if $layout.currentAnnotation != null && $layout.currentAnnotation.page == page.pageNumber && !$layout.currentAnnotation.isPageNote}
        <div
          class="annotation"
          class:public={$layout.currentAnnotation.access == "public"}
          class:organization={$layout.currentAnnotation.access ==
            "organization"}
          class:private={$layout.currentAnnotation.access == "private"}
          style="left: {$layout.currentAnnotation.x1 * 100}%; top: {$layout
            .currentAnnotation.y1 * 100}%;
          width: {$layout
            .currentAnnotation.width * 100}%; height: {$layout.currentAnnotation
            .height * 100}%"
        />
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
          aspect={page.aspect}
        />
      {/if}
    {/if}
  </div>
</div>

<svelte:window on:mouseup={handleMouseUp} />
