<script>
  import Image from "@/common/Image";
  import Button from "@/common/Button";
  import Loader from "@/common/Loader";
  import { textAreaResize } from "@/util/textareaResize.js";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { pageImageUrl } from "@/api/viewer";
  import { viewer } from "@/viewer/viewer";
  import {
    layout,
    cancelAnnotation,
    updatePageAnnotation,
    createPageAnnotation,
    deletePageAnnotation
  } from "@/viewer/layout";
  import { wrapSeparate } from "@/util/wrapLoad";

  // SVG assets
  import closeInlineSvg from "@/assets/close_inline.svg";
  import privateIconSvg from "@/assets/private_icon.svg";
  import publicIconSvg from "@/assets/public_icon.svg";
  import organizationIconSvg from "@/assets/organization_icon.svg";
  import pencilSvg from "@/assets/pencil.svg";

  // Asynchronously load dompurify
  let DomPurify = null;
  import("dompurify").then(module => {
    DomPurify = module;
  });

  export let document;
  export let annotation;
  export let aspect;
  export let mode;

  let editOverride = false;
  let loading = writable(false);

  let title = annotation.title;
  let description = annotation.content;
  export let access = annotation.access;

  $: editMode = mode == "edit" || editOverride;

  $: titleValid = title.trim().length > 0;
  $: accessValid =
    (document.editAccess && access == "public") ||
    access == "organization" ||
    access == "private" ||
    access == "private";

  $: changed =
    title != annotation.title ||
    description != annotation.content ||
    access != annotation.access;
  $: changeValid = (mode == "view" && changed) || mode == "edit";

  $: valid = titleValid && accessValid && changeValid;

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
          document.id,
          title,
          description,
          access,
          annotation
        );
      } else {
        await createPageAnnotation(
          document.id,
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
      await deletePageAnnotation(annotation.id, document.id);
    });
  }
</script>

<style lang="scss">
  $annotationBg: white;
  $padding: 10px;
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
      font-size: 12px;
      width: 100%;
      padding: 2px 4px;
      box-sizing: border-box;
      outline: none;
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
        margin: 2px 8px;
        color: $viewerGray;
      }

      .content {
        margin: 4px 8px;
        font: 13px/18px Georgia, Times, serif;
        cursor: text;
        color: #3c3c3c;
      }

      &.static .content {
        margin: 0 0 8px 0;
      }
    }

    .access {
      $spacing: 10px;

      display: table;
      table-layout: fixed;
      width: calc(100% + #{$spacing * 2});
      margin: 0 ($spacing * -1);
      border-spacing: $spacing;
      border-collapse: separate;

      .container {
        display: table-cell;
        vertical-align: top;
        border-radius: $radius;
        border: solid 2px transparent;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.25);
        cursor: pointer;
        transition: border 0.2s ease;
        opacity: 0.5;
        user-select: none;

        &:hover {
          opacity: 0.9;
        }

        &.selected {
          opacity: 1;
        }

        &.public {
          &:hover {
            border: solid 2px rgba($annotationBorder, 0.4);
          }

          &.selected {
            border: solid 2px $annotationBorder;
          }
        }

        &.organization {
          &:hover {
            border: solid 2px rgba($organizationAnnotation, 0.4);
          }

          &.selected {
            border: solid 2px $organizationAnnotation;
          }
        }

        &.private {
          &:hover {
            border: solid 2px rgba($privateAnnotation, 0.4);
          }

          &.selected {
            border: solid 2px $privateAnnotation;
          }
        }

        .item {
          display: table;
          border-spacing: 0;
          width: 100%;

          .icon {
            display: table-cell;
            vertical-align: top;
            width: 30px;
            text-align: center;
            padding-top: 11px;
          }

          .contents {
            display: table-cell;
            vertical-align: top;
            padding-right: 8px;

            h3 {
              font-size: 14px;
              margin: 8px 0 0 0;
            }

            p {
              margin: 6px 0 12px 0;
            }
          }
        }
      }
    }

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
  }
</style>

<div
  class="annotation"
  class:public={access == 'public'}
  class:organization={access == 'organization'}
  class:private={access == 'private'}
  class:disabled={$loading}
  on:mousedown|stopPropagation
  style="top: {annotation.y1 * 100}%; height: {annotation.height * 100}%">
  <header bind:this={annotationElem}>
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
          bind:value={title} />
      {:else}
        <h1>
          {annotation.title}
          <span class="pencil" on:click={() => (editOverride = true)}>
            {@html pencilSvg}
          </span>
        </h1>
      {/if}
    </Loader>
  </header>
  <div class="excerpt">
    <div class="body">
      <div style="margin-top: {-annotation.y1 * aspect * 100}%">
        <Image
          src={pageImageUrl(document, annotation.page)}
          fade={false}
          {aspect} />
        <!-- Faded flanks -->
        <div
          class="faded left"
          style="left: 0; width: {annotation.x1 * 100}%" />
        <div
          class="faded right"
          style="left: {annotation.x2 * 100}%; right: 0" />
      </div>
    </div>
  </div>
  <footer>
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
      <div class="access">
        {#if document.editAccess}
          <div
            class="container public"
            class:selected={access == 'public'}
            on:click={() => (access = 'public')}>
            <div class="item">
              <span class="icon">
                {@html publicIconSvg}
              </span>
              <div class="contents">
                <h3>Public</h3>
                <p>
                  Note will be visible to anyone with access to the document.
                </p>
              </div>
            </div>
          </div>
          <div
            class="container organization"
            class:selected={access == 'organization'}
            on:click={() => (access = 'organization')}>
            <div class="item">
              <span class="icon">
                {@html organizationIconSvg}
              </span>
              <div class="contents">
                <h3>Collaborator</h3>
                <p>
                  Note will be visible to anyone who can edit this document.
                </p>
              </div>
            </div>
          </div>
        {/if}
        <div
          class="container private"
          class:selected={access == 'private'}
          on:click={() => (access = 'private')}>
          <div class="item">
            <span class="icon">
              {@html privateIconSvg}
            </span>
            <div class="contents">
              <h3>Private</h3>
              <p>Note will be visible to you alone.</p>
            </div>
          </div>
        </div>
      </div>
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
