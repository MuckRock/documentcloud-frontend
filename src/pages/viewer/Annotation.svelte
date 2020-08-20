<script>
  import ProgressiveImage from "@/common/ProgressiveImage";
  import Button from "@/common/Button";
  import Loader from "@/common/Loader";
  import AccessToggle from "@/common/AccessToggle";
  import { textAreaResize } from "@/util/textareaResize.js";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { pageImageUrl } from "@/api/viewer";
  import { viewer } from "@/viewer/viewer";
  import { doc } from "@/viewer/document";
  import {
    layout,
    cancelAnnotation,
    updatePageAnnotation,
    createPageAnnotation,
    deletePageAnnotation
  } from "@/viewer/layout";
  import { wrapSeparate } from "@/util/wrapLoad";
  import emitter from "@/emit";

  // SVG assets
  import closeInlineSvg from "@/assets/close_inline.svg";
  import simpleLinkSvg from "@/assets/simplelink.svg";
  import pencilSvg from "@/assets/pencil.svg";

  // Asynchronously load dompurify
  let DomPurify = null;
  import("dompurify").then(module => {
    DomPurify = module;
  });

  const emit = emitter({
    stateChange() {}
  });

  export let page;
  export let pageNote = false;
  export let showImageOnPageNote = false;
  export let width;
  export let annotation;
  export let aspect;
  export let mode;
  export let y;
  export let height;
  export let grayed = false;
  export let behind = false;

  let editOverride = false;
  let loading = writable(false);

  let title = annotation.title;
  let description = annotation.content;
  export let access = annotation.access;

  $: editMode = mode == "edit" || editOverride;
  $: {
    editMode;
    description;
    // Emit state changes to capture mutations
    emit.stateChange();
  }

  $: titleValid = title.trim().length > 0;
  $: accessValid =
    (page.document.editAccess && access == "public") ||
    access == "organization" ||
    access == "private" ||
    access == "private";

  $: changed =
    title != annotation.title ||
    description != annotation.content ||
    access != annotation.access;
  $: changeValid = (mode == "view" && changed) || mode == "edit";

  $: valid = titleValid && accessValid && changeValid;

  // Heights
  let headerHeight;
  let footerHeight;
  let footerWidth;

  const ANNOTATION_PADDING = 20;
  $: y1 =
    headerHeight == null ? null : y + annotation.y1 * height - headerHeight;
  $: y2 =
    footerHeight == null ? null : y + annotation.y2 * height + footerHeight;

  $: shift =
    y1 == null || y2 == null
      ? "none"
      : y1 < ANNOTATION_PADDING
      ? "down"
      : y2 > $doc.docHeight - ANNOTATION_PADDING
      ? "up"
      : "none";

  $: noteUrl = page.document.noteHashUrl(annotation);

  // Focus on title on mount
  let titleInput;
  let annotationElem;
  onMount(async () => {
    if (titleInput != null) titleInput.focus();

    // Update elem for scrolling purposes
    layout.displayedAnnotationElemRaw = annotationElem;
  });

  // Create annotation
  async function createOrUpdateAnnotation() {
    if (!valid) return;

    await wrapSeparate(loading, layout, async () => {
      if (editOverride) {
        // Update annotation
        annotation = await updatePageAnnotation(
          annotation.id,
          page.document.id,
          title,
          description,
          access,
          annotation
        );
      } else {
        await createPageAnnotation(
          page.document.id,
          title,
          description,
          access,
          annotation
        );
        layout.defaultAnnotationAccess = access;
      }
    });

    handleCancel();
  }

  function handleCancel() {
    if (editOverride) {
      // Restore fields
      title = annotation.title;
      description = annotation.content;
      access = annotation.access;
      editOverride = false;
    } else {
      cancelAnnotation();
    }
  }

  async function handleDelete() {
    await wrapSeparate(loading, layout, async () => {
      await deletePageAnnotation(annotation.id, page.document.id);
    });
  }
</script>

<style lang="scss">
  $annotationBg: white;
  $padding: 10px;
  $subpadding: 8px;
  $insetMargin: 1px;

  .annotation {
    &.disabled {
      header *,
      footer *,
      .excerpt * {
        pointer-events: none;
      }

      header .closeflag {
        pointer-events: all;
      }
    }

    &.grayed {
      pointer-events: none;
      filter: brightness(0.8);
    }

    &.behind {
      z-index: ($viewerAnnotationZ - 1);
    }

    &.public {
      $border: solid $annotationBorderWidth $annotationBorder;
      .excerpt::before {
        border-left: $border;
        border-right: $border;
      }

      header {
        border-top: $border;
        border-left: $border;
        border-right: $border;
      }

      footer {
        border-left: $border;
        border-right: $border;
        border-bottom: $border;
      }

      .closeflag {
        background: $annotationBorder;
      }
    }

    &.organization {
      $border: solid $annotationBorderWidth $organizationAnnotation;
      .excerpt::before {
        border-left: $border;
        border-right: $border;
      }

      header {
        border-top: $border;
        border-left: $border;
        border-right: $border;
      }

      footer {
        border-left: $border;
        border-right: $border;
        border-bottom: $border;
      }

      .closeflag {
        background: $organizationAnnotation;
      }
    }

    &.private {
      $border: solid $annotationBorderWidth $privateAnnotation;
      .excerpt::before {
        border-left: $border;
        border-right: $border;
      }

      header {
        border-top: $border;
        border-left: $border;
        border-right: $border;
      }

      footer {
        border-left: $border;
        border-right: $border;
        border-bottom: $border;
      }

      .closeflag {
        background: $privateAnnotation;
      }
    }

    position: absolute;
    background: gainsboro;
    left: 0;
    right: 0;
    z-index: $viewerAnnotationZ;

    .excerpt {
      overflow: hidden;
      height: 100%;
      margin: (-$padding - $insetMargin)
        (-$padding - $annotationBorderWidth - $insetMargin);
      border-left: solid ($padding + $annotationBorderWidth) $annotationBg;
      border-right: solid ($padding + $annotationBorderWidth) $annotationBg;
      border-top: solid $padding $annotationBg;
      border-bottom: solid $padding $annotationBg;
      background: $annotationBg;

      &::before {
        content: "";
        position: absolute;
        top: -$padding - $insetMargin;
        left: -$padding - $insetMargin - $annotationBorderWidth;
        right: -$padding - $insetMargin - $annotationBorderWidth;
        bottom: -$padding + $insetMargin;
        box-sizing: border-box;
      }

      &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: $insetMargin * 2;
      }

      .body {
        overflow: hidden;
        height: 100%;
        border: $insetMargin solid #d0d0d0;
        box-sizing: border-box;
        border-radius: 2px;

        .faded {
          position: absolute;
          top: 0;
          left: 0;
          bottom: $insetMargin * 2;
          background: rgba(white, 0.8);
          box-shadow: inset 0 0 5px #000;
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);

          &.nobottom {
            bottom: 0;
          }

          &.left {
            border-right: 1px solid #ddd;
            border-right: 1px solid rgba(221, 221, 221, 0.4);
          }

          &.right {
            border-left: 1px solid #ddd;
            border-left: 1px solid rgba(221, 221, 221, 0.4);
          }
        }
      }
    }

    footer,
    header {
      position: absolute;
      font-size: 12px;
      text-align: left;
      padding: 0 $padding;
      left: -$padding - $insetMargin - $annotationBorderWidth;
      right: -$padding - $insetMargin - $annotationBorderWidth;
      background: $annotationBg;
      box-sizing: border-box;
    }

    header {
      bottom: 100%;
      margin-top: -$padding;
      margin-bottom: $padding;
      padding-top: $padding;

      // Borders
      border-top-left-radius: $radius;
      border-top-right-radius: $radius;

      h1 {
        font-weight: bold;
        font-size: 14px;
        margin: 0;
      }
    }

    footer {
      top: 100%;
      margin-top: $padding - $insetMargin;
      margin-bottom: -$padding;
      padding-bottom: $padding;

      // Borders
      border-bottom-left-radius: $radius;
      border-bottom-right-radius: $radius;
      box-sizing: border-box;

      &.capsize {
        max-height: 200px;
        overflow-y: auto;
      }

      .buttonpadded {
        margin: 7px -4px;

        :global(button) {
          margin: 0 4px;
        }
      }
    }

    .closeflag {
      $flagHeight: 25px;
      $flagWidth: 29px;
      $closeHeight: 14px;

      position: absolute;
      top: 20px;
      left: -$flagWidth - $annotationBorderWidth;
      width: $flagWidth;
      height: $flagHeight;
      border-top-left-radius: ($flagHeight / 2);
      border-bottom-left-radius: ($flagHeight / 2);

      .closer {
        @include buttonLike;
        display: inline-block;

        :global(svg) {
          width: $closeHeight;
          height: $closeHeight;
          margin: ($flagHeight - $closeHeight) / 2;
        }
      }
    }

    input,
    textarea {
      font-size: 16px;
      width: 100%;
      padding: 2px 4px;
      box-sizing: border-box;
      outline: none;
    }

    input.padded {
      margin-bottom: $subpadding;
    }

    .sidebyside {
      display: table;
      table-layout: fixed;
      width: 100%;

      > * {
        display: table-cell;
        vertical-align: top;
      }
    }

    .preview {
      margin: 4px 0;

      .title {
        font-weight: bold;
        text-transform: uppercase;
        font-size: 10px;
        margin: 2px $subpadding;
        color: $viewerGray;
      }

      .content {
        margin: 4px $subpadding;
        font: 13px/18px Georgia, Times, serif;
        cursor: text;
        color: #3c3c3c;
      }

      &.static .content {
        margin: 0 0 $subpadding 0;
      }
    }

    .link,
    .pencil {
      @include buttonLike;

      vertical-align: middle;
      margin-left: 3px;
    }

    .twopanel {
      display: table;
      width: 100%;
      color: $viewerGray;
      font-size: 11px;

      .cell {
        display: table-cell;
      }

      .leftalign {
        text-align: left;
      }

      .rightalign {
        text-align: right;
      }
    }

    &.up,
    &.pagenote {
      bottom: $padding;

      footer,
      header {
        position: relative;
        margin-right: -$padding * 2 - $subpadding;
      }

      .excerpt {
        position: relative;
        overflow: visible;
        margin: -10px -13px;
      }
    }

    &.pagenote {
      position: relative;
      margin-left: 10px;
      margin-right: 10px;
      padding-top: 5px;
      padding-bottom: 5px;
      bottom: 0;
      background: none;

      header {
        margin-bottom: 0;
        margin-top: 0;
        padding-bottom: 8px;

        &.showimage {
          margin-bottom: 2px;
        }
      }

      footer {
        margin-top: 0;
        margin-bottom: 0;

        &.showimage {
          margin-top: 8px;
        }
      }
    }
  }

  .hidden {
    visibility: hidden;
  }
</style>

<div
  class="annotation"
  class:grayed
  class:behind
  class:pagenote={pageNote}
  class:up={shift == 'up'}
  class:public={access == 'public'}
  class:organization={access == 'organization'}
  class:private={access == 'private'}
  class:disabled={$loading}
  on:mousedown|stopPropagation
  style={shift == 'up' || pageNote ? '' : `top: ${annotation.y1 * 100}%; height: ${annotation.height * 100}%`}>
  <header
    bind:this={annotationElem}
    bind:offsetHeight={headerHeight}
    class:showimage={showImageOnPageNote}
    class:hidden={shift == 'down'}>
    {#if !pageNote}
      <div class="closeflag">
        <span class="closer" on:click={cancelAnnotation}>
          {@html closeInlineSvg}
        </span>
      </div>
    {/if}
    <Loader active={$loading} transparent={true}>
      <!-- Title -->
      {#if editMode}
        <input
          bind:this={titleInput}
          placeholder="Annotation Title"
          bind:value={title} />
      {:else}
        <h1>
          {annotation.title}
          <a class="link" href={noteUrl}>
            {@html simpleLinkSvg}
          </a>
          {#if page.document.editAccess}
            <span class="pencil" on:click={() => (editOverride = true)}>
              {@html pencilSvg}
            </span>
          {/if}
        </h1>
      {/if}
    </Loader>
  </header>
  {#if shift == 'down'}
    <header />
  {/if}
  {#if !pageNote || showImageOnPageNote}
    <div class="excerpt">
      <div
        class="body"
        style={showImageOnPageNote ? `height: 0; padding-top: ${annotation.height * aspect * 100}%` : ''}>
        <div
          style="margin-top: {-annotation.y1 * aspect * 100 - (showImageOnPageNote ? annotation.height * aspect * 100 : 0)}%">
          <ProgressiveImage
            alt="Page {page.pageNumber + 1} of {page.document.title}"
            {width}
            aspect={page.aspect}
            {page} />
          <!-- Faded flanks -->
          <div
            class="faded left"
            class:nobottom={showImageOnPageNote}
            style="left: 0; width: {annotation.x1 * 100}%" />
          <div
            class="faded right"
            class:nobottom={showImageOnPageNote}
            style="left: {annotation.x2 * 100}%; right: 0" />
        </div>
      </div>
    </div>
  {/if}
  <footer
    bind:offsetHeight={footerHeight}
    bind:offsetWidth={footerWidth}
    class:showimage={showImageOnPageNote}
    class:capsize={pageNote && !editMode}>
    {#if shift == 'down'}
      <div class="closeflag">
        <span class="closer" on:click={cancelAnnotation}>
          {@html closeInlineSvg}
        </span>
      </div>
      <Loader active={$loading} transparent={true}>
        <!-- Title -->
        {#if editMode}
          <input
            bind:this={titleInput}
            placeholder="Annotation Title"
            bind:value={title}
            class="padded" />
        {:else}
          <h1>
            {annotation.title}
            <a class="link" href={noteUrl}>
              {@html simpleLinkSvg}
            </a>
            {#if page.document.editAccess}
              <span class="pencil" on:click={() => (editOverride = true)}>
                {@html pencilSvg}
              </span>
            {/if}
          </h1>
        {/if}
      </Loader>
    {/if}

    <div class="sidebyside">
      <!-- Description/Content -->
      {#if editMode}
        <textarea
          placeholder="Annotation Description (optional)"
          use:textAreaResize
          bind:value={description} />
        {#if DomPurify != null && description.trim().length > 0}
          <div class="preview">
            <div class="title">Preview:</div>
            <!-- Show a preview if possible -->
            <div class="content">
              {@html DomPurify.sanitize(description)}
            </div>
          </div>
        {/if}
      {:else}
        <div class="preview static">
          <div class="content">
            {#if DomPurify != null}
              {@html DomPurify.sanitize(annotation.content)}
            {:else}
              <!-- Risk showing server-provided HTML without sanitization -->
              {@html annotation.content}
            {/if}
          </div>
        </div>
      {/if}
    </div>
    <!-- Footer content -->
    {#if editMode}
      <AccessToggle
        stacked={footerWidth < 350}
        bind:access
        editAccess={page.document.editAccess} />
      <div class="buttonpadded">
        <Button
          on:click={createOrUpdateAnnotation}
          disabledReason={titleValid ? (changeValid ? null : 'Note remains unchanged') : 'Enter a title for the annotation'}>
          {#if editOverride}Update{:else}Save{/if}
        </Button>
        {#if editOverride}
          <Button danger={true} on:click={handleDelete}>Delete</Button>
        {/if}
        <Button secondary={true} on:click={handleCancel}>Cancel</Button>
      </div>
    {:else}
      <div class="twopanel">
        <div class="cell leftalign">
          {#if access == 'organization'}
            This note is only visible to you and your organization
          {:else if access == 'private'}
            This private note is only visible to you
          {/if}
        </div>
        <div class="cell rightalign">
          Annotated by {annotation.username}
          {#if annotation.organization != null}, {annotation.organization}{/if}
        </div>
      </div>
    {/if}
  </footer>
</div>
