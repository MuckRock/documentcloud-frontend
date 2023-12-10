<script>
  import DomPurify from "dompurify";
  import { _ } from "svelte-i18n";

  import ProgressiveImage from "@/common/ProgressiveImage.svelte";

  import { informSize } from "@/embed/iframeSizer.js";
  import { onMount, tick } from "svelte";
  import { getAnnotation } from "@/api/annotation.js";
  import { getDocument } from "@/api/document.js";
  import { pageImageUrl } from "@/api/viewer.js";
  import { embedUrl } from "@/api/embed.js";
  import {
    getCurrentUrl,
    truthyParamValue,
    getQueryStringParams,
  } from "@/util/url.js";

  export let id;
  export let noteId;

  $: docId = id.split("-")[0];

  let doc = null;
  let note = null;
  let elem;

  const showStaticImage = truthyParamValue(
    getQueryStringParams(getCurrentUrl()).embed,
  );

  $: canonicalNoteUrl = note == null ? "" : doc.canonicalNoteUrl(note);
  $: title =
    doc == null || note == null
      ? ""
      : `${note.title} (${$_("document.pageAbbrev")} ${note.page + 1})`;

  $: aspect = doc == null || note == null ? 0 : doc.pageSizes[note.page];
  const docWidth = 700;
  $: maxWidth = note == null ? 0 : docWidth * note.width;

  const IMAGE_WIDTHS = import.meta.env.DC_IMAGE_WIDTHS.split(",")
    .map((x) => x.split(":"))
    .map((x) => [parseFloat(x[1]), x[0]])
    .sort((a, b) => a[0] - b[0]);
  const LARGE_WIDTH = IMAGE_WIDTHS.map((x, i) => [x, i]).filter(
    (x) => x[0][1] == "large",
  )[0];

  onMount(async () => {
    // Get document/note
    doc = await getDocument(docId);
    note = await getAnnotation(docId, noteId.split(".")[0]);

    // Render content
    await tick();

    if (!showStaticImage) {
      // Inform iframe of size updates
      informSize(elem);
    }
  });
</script>

<style lang="scss">
  .DC-note {
    position: relative;
    padding: 0 0.5em;
    border: 1px solid #ebebeb;
    box-shadow: inset 0 0 40px #505050;
    font:
      400 10pt/14pt -apple-system,
      system-ui,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      "Helvetica Neue",
      Arial,
      sans-serif;
    color: black;
    background-color: white;
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-position: center center;

    a {
      color: #5a76a0;
      text-decoration: underline;
    }

    > * {
      position: relative;
      z-index: 1;
    }

    .DC-note-header,
    .DC-note-body,
    :global(.DC-note-credit) {
      margin: 10px auto;
      padding: 0 5px;
      max-width: 600px;
    }

    .DC-note-title {
      font-weight: bold;
    }

    .DC-note-image-max-bounds {
      box-sizing: border-box;
      border-radius: $radius;
      box-shadow: 0 0 7px rgba(0, 0, 0, 0.25);
      position: relative;
      font-size: 0;
      overflow: hidden;
      margin: 10px auto;

      &.public {
        border: $annotationBorderWidth solid $annotationBorder;
      }

      &.organization {
        border: $annotationBorderWidth solid $organizationAnnotation;
      }

      &.private {
        border: $annotationBorderWidth solid $privateAnnotation;
      }

      .DC-note-image-aspect-ratio {
        position: relative;
        overflow: hidden;
        height: 0;
        max-width: 100%;

        .DC-note-image-link {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          display: block;

          :global(img) {
            margin: 0 !important;
            border: 0 !important;
            outline: 0 !important;
            max-width: none !important;
            max-height: none !important;
            display: block !important;
            position: absolute;
            height: auto;
          }
        }
      }
    }

    .DC-note-credit {
      font-size: 0.9em;
    }

    :global(.DC-note-logotype-link) {
      font-weight: 700;
      font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI",
        Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    .DC-note-background-fader {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 0;
      background-color: rgba(255, 255, 255, 0.93);
    }
  }
</style>

<svelte:head>
  {#if doc != null && note != null && canonicalNoteUrl != "" && title != ""}
    <!-- Insert canonical URL -->
    <link rel="canonical" href={canonicalNoteUrl} />

    <!-- Social cards -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="og:url" content={canonicalNoteUrl} />
    <meta property="og:url" content={canonicalNoteUrl} />
    <meta property="og:title" content={title} />
    <title>{title} - DocumentCloud</title>
    <link
      rel="alternate"
      type="application/json+oembed"
      href={embedUrl(canonicalNoteUrl)}
      {title}
    />
    {#if note.description != null && note.description.trim().length > 0}
      <meta property="og:description" content={note.description} />
    {/if}
    <meta property="og:image" content={pageImageUrl(doc, note.page, 700, 1)} />
  {/if}
</svelte:head>

{#if showStaticImage}
  {#if doc != null && note != null}
    <a href={doc.noteUrl(note)} target="_blank" class="DC-note-image-link">
      <ProgressiveImage
        transform={`scale(${1 / note.width}) translate(${-note.x1 * 100}%, ${
          -note.y1 * 100
        }%)`}
        alt="Page {note.page + 1} of {doc.title}"
        width={docWidth}
        {aspect}
        page={{ document: doc, pageNumber: note.page }}
      />
    </a>
  {/if}
{:else}
  <div
    class="DC-note"
    bind:this={elem}
    style={note != null && doc != null
      ? `background-image: url(${pageImageUrl(doc, note.page, LARGE_WIDTH)})`
      : ""}
  >
    {#if note != null && doc != null}
      <div class="DC-note-header">
        <a
          href={doc.noteUrl(note)}
          class="DC-note-embed-resource"
          target="_blank"
          title={$_("embedNote.viewTheNote", { value: { title: note.title } })}
        >
          <span class="DC-note-title">{note.title}</span>
          <span class="DC-note-page-number"
            >({$_("document.pageAbbrev")} {note.page + 1})</span
          >
        </a>
      </div>

      <div
        class="DC-note-image-max-bounds"
        class:public={note.access == "public"}
        class:organization={note.access == "organization"}
        class:private={note.access == "private"}
        style="max-width: {maxWidth}px;"
      >
        <div
          class="DC-note-image-aspect-ratio"
          style="padding-bottom: {(note.height / note.width) * aspect * 100}%"
        >
          <a
            href={doc.noteUrl(note)}
            target="_blank"
            class="DC-note-image-link"
            style="left: -{(note.x1 * 100) / note.width}%; top: -{(note.y1 *
              100) /
              note.height}%;
          width: {100 / note.width}%; height: {100 / note.height}%"
          >
            <ProgressiveImage
              alt="Page {note.page + 1} of {doc.title}"
              width={docWidth}
              {aspect}
              page={{ document: doc, pageNumber: note.page }}
            />
          </a>
        </div>
      </div>

      <div class="DC-note-body">
        {@html DomPurify.sanitize(note.content)}
      </div>

      <div class="DC-note-credit">
        <a
          href={doc.noteUrl(note)}
          target="_blank"
          title={$_("embedNote.viewTheNote", { values: { title: note.title } })}
        >
          {@html $_("embedNote.viewDoc")}
        </a>
      </div>

      <div class="DC-note-background-fader" />
    {/if}
  </div>
{/if}
