<script>
  import ProgressiveImage from "@/common/ProgressiveImage";
  import Button from "@/common/Button";
  import Loader from "@/common/Loader";
  import AccessToggle from "@/common/AccessToggle";
  import HtmlEditor from "@/common/HtmlEditor";
  import HtmlField from "@/common/HtmlField";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { doc } from "@/viewer/document";
  import {
    layout,
    cancelAnnotation,
    updatePageAnnotation,
    createPageAnnotation,
    deletePageAnnotation,
  } from "@/viewer/layout";
  import { wrapSeparate } from "@/util/wrapLoad";
  import emitter from "@/emit";
  import { _ } from "svelte-i18n";

  // SVG assets
  import closeInlineSvg from "@/assets/close_inline.svg";
  import simpleLinkSvg from "@/assets/simplelink.svg";
  import pencilSvg from "@/assets/pencil.svg";

  // Asynchronously load dompurify
  import { loadDompurify } from "@/util/domPurify";
  loadDompurify();

  const noteTitleLimit = process.env.NOTE_TITLE_CHAR_LIMIT;
  const noteContentLimit = process.env.NOTE_CONTENT_CHAR_LIMIT;

  const emit = emitter({
    stateChange() {},
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
  export let compact = false;
  export let titlePassages = null;
  export let hlContent = null;

  console.log("ANNOTATION", annotation.id, titlePassages, hlContent);

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
          annotation,
        );
      } else {
        await createPageAnnotation(
          page.document.id,
          title,
          description,
          access,
          annotation,
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

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && (e.which == 13 || e.keyCode == 13)) {
      createOrUpdateAnnotation();
    }
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

    input {
      font-size: 16px;
      width: 100%;
      padding: 2px 4px;
      box-sizing: border-box;
      outline: none;
    }

    input.padded {
      margin-bottom: $subpadding;
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

  .highlight {
    .passage {
      &.highlighted {
        background: $annotationBorder;
      }
    }

    :global(em) {
      font-style: normal;
      background: $annotationBorder;
    }
  }

</style>

<div
  class="annotation"
  class:grayed
  class:behind
  class:pagenote={pageNote}
  class:up={shift == "up"}
  class:public={access == "public"}
  class:organization={access == "organization"}
  class:private={access == "private"}
  class:disabled={$loading}
  on:mousedown|stopPropagation
  style={shift == "up" || pageNote
    ? ""
    : `top: ${annotation.y1 * 100}%; height: ${annotation.height * 100}%`}
>
  <header
    bind:this={annotationElem}
    bind:offsetHeight={headerHeight}
    class:showimage={showImageOnPageNote}
    class:hidden={shift == "down"}
  >
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
          maxlength={noteTitleLimit}
          bind:this={titleInput}
          placeholder={$_("annotation.title")}
          bind:value={title}
        />
      {:else}
        <h1>
          {#if titlePassages}
            {#each titlePassages as passage}
              <h1 class="highlight">
                {#each passage as term}
                  {#if term.type == "highlight"}
                    <span class="passage highlighted">{term.text}</span>
                  {:else}
                    <span class="passage">{term.text}</span>
                  {/if}
                {/each}
              </h1>
            {/each}
          {:else}
            {annotation.title}
          {/if}
          {#if !compact}
            <a class="link" href={noteUrl}>
              {@html simpleLinkSvg}
            </a>
            {#if page.document.editAccess}
              <span class="pencil" on:click={() => (editOverride = true)}>
                {@html pencilSvg}
              </span>
            {/if}
          {/if}
        </h1>
      {/if}
    </Loader>
  </header>
  {#if shift == "down"}
    <header />
  {/if}
  {#if !pageNote || showImageOnPageNote}
    <div class="excerpt">
      <div
        class="body"
        style={showImageOnPageNote
          ? `height: 0; padding-top: ${annotation.height * aspect * 100}%`
          : ""}
      >
        <div
          style="margin-top: {-annotation.y1 * aspect * 100 -
            (showImageOnPageNote ? annotation.height * aspect * 100 : 0)}%"
        >
          <ProgressiveImage
            alt="Page {page.pageNumber + 1} of {page.document.title}"
            {width}
            aspect={page.aspect}
            {page}
          />
          <!-- Faded flanks -->
          <div
            class="faded left"
            class:nobottom={showImageOnPageNote}
            style="left: 0; width: {annotation.x1 * 100}%"
          />
          <div
            class="faded right"
            class:nobottom={showImageOnPageNote}
            style="left: {annotation.x2 * 100}%; right: 0"
          />
        </div>
      </div>
    </div>
  {/if}
  <footer
    bind:offsetHeight={footerHeight}
    bind:offsetWidth={footerWidth}
    class:showimage={showImageOnPageNote}
    class:capsize={pageNote && !editMode}
  >
    {#if shift == "down"}
      <div class="closeflag">
        <span class="closer" on:click={cancelAnnotation}>
          {@html closeInlineSvg}
        </span>
      </div>
      <Loader active={$loading} transparent={true}>
        <!-- Title -->
        {#if editMode}
          <input
            maxlength={noteTitleLimit}
            bind:this={titleInput}
            placeholder={$_("annotation.title")}
            bind:value={title}
            class="padded"
          />
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

    <!-- Description/Content -->
    {#if editMode}
      <HtmlEditor
        maxlength={noteContentLimit}
        placeholder={$_("annotation.description")}
        bind:value={description}
      />
    {:else if hlContent}
      <span class="highlight">
        <HtmlField content={hlContent} />
      </span>
    {:else}
      <HtmlField content={annotation.content} />
    {/if}
    <!-- Footer content -->
    {#if editMode}
      <AccessToggle
        stacked={footerWidth < 350}
        bind:access
        editAccess={page.document.editAccess}
      />
      <div class="buttonpadded">
        <Button
          on:click={createOrUpdateAnnotation}
          disabledReason={titleValid
            ? changeValid
              ? null
              : $_("annotation.unchanged")
            : $_("annotation.noTitle")}
        >
          {#if editOverride}{$_("dialog.update")}{:else}{$_("dialog.save")}{/if}
        </Button>
        {#if editOverride}
          <Button danger={true} on:click={handleDelete}
            >{$_("dialog.delete")}</Button
          >
        {/if}
        <Button secondary={true} on:click={handleCancel}
          >{$_("dialog.cancel")}</Button
        >
      </div>
    {:else if !compact}
      <div class="twopanel">
        <div class="cell leftalign">
          {#if access == "organization"}
            {$_("annotation.org")}
          {:else if access == "private"}
            {$_("annotation.private")}
          {/if}
        </div>
        <div class="cell rightalign">
          {#if annotation.organization == null}
            {$_("annotation.by", { values: { name: annotation.username } })}
          {:else}
            {$_("annotation.byOrg", {
              values: {
                name: annotation.username,
                org: annotation.organization,
              },
            })}
          {/if}
        </div>
      </div>
    {/if}
  </footer>
</div>

<svelte:window on:keydown={handleKeyDown} />
