<script lang="ts">
  import DomPurify from "dompurify";
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import { informSize } from "@/embed/iframeSizer.js";
  import { pageImageUrl } from "@/lib/api/documents";
  import * as notes from "$lib/api/notes.js";
  import { embedUrl } from "$lib/api/embed";
  import { canonicalNoteUrl, noteUrl } from "$lib/api/notes.js";
  import { pageSizesFromSpec } from "@/api/pageSize.js";
  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";

  export let data;

  const docWidth = IMAGE_WIDTHS_MAP.get("normal");

  let elem;

  $: doc = data.document;
  $: note = data.note;
  $: alt = `Page ${note.page_number + 1} of ${doc.title}`;
  $: src = pageImageUrl(doc, note.page_number + 1, "normal").toString();
  $: sizes = pageSizesFromSpec(doc.page_spec);
  $: aspect = sizes[note.page_number];
  $: url = canonicalNoteUrl(doc, note).toString();
  $: title = `${note.title} (${$_("document.pageAbbrev")} ${
    note.page_number + 1
  })`;
  $: maxWidth = docWidth * notes.width(note);
  $: height = docWidth * aspect;

  onMount(async () => {
    informSize(elem);
  });
</script>

<svelte:head>
  <!-- Insert canonical URL -->
  <link rel="canonical" href={url} />

  <!-- Social cards -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="og:url" content={url} />
  <meta property="og:url" content={url} />
  <meta property="og:title" content={title} />
  <title>{title} - DocumentCloud</title>
  <link
    rel="alternate"
    type="application/json+oembed"
    href={embedUrl(url).toString()}
    {title}
  />
  {#if note.content}
    <meta property="og:description" content={note.content} />
  {/if}
  <meta property="og:image" content={src} />
</svelte:head>

<div class="DC-note" bind:this={elem} style={`background-image: url(${src})`}>
  <div class="DC-note-header">
    <a
      href={noteUrl(doc, note).toString()}
      class="DC-note-embed-resource"
      target="_blank"
      title={$_("embedNote.viewTheNote", { values: { title: note.title } })}
    >
      <span class="DC-note-title">{note.title}</span>
      <span class="DC-note-page-number"
        >({$_("document.pageAbbrev")} {note.page_number + 1})</span
      >
    </a>
  </div>

  <div
    class="DC-note-image-max-bounds"
    class:public={note.access === "public"}
    class:organization={note.access === "organization"}
    class:private={note.access === "private"}
    style:max-width="{maxWidth}px"
  >
    <div
      class="DC-note-image-aspect-ratio"
      style:padding-bottom="{(notes.height(note) / notes.width(note)) *
        aspect *
        100}%"
    >
      <a
        href={noteUrl(doc, note).toString()}
        target="_blank"
        class="DC-note-image-link"
        style:left="{(note.x1 * -100) / notes.width(note)}%"
        style:top="{(note.y1 * -100) / notes.height(note)}%"
        style:width="{100 / notes.width(note)}%"
        style:height="{100 / notes.height(note)}%"
      >
        <img {src} {alt} width="{docWidth}px" height="{height}px" />
      </a>
    </div>
  </div>

  <div class="DC-note-body">
    {@html DomPurify.sanitize(note.content)}
  </div>

  <div class="DC-note-credit">
    <a
      href={noteUrl(doc, note).toString()}
      target="_blank"
      title={$_("embedNote.viewTheNote", { values: { title: note.title } })}
    >
      {@html $_("embedNote.viewDoc")}
    </a>
  </div>

  <div class="DC-note-background-fader" />
</div>

<style>
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
  }

  .DC-note a {
    color: #5a76a0;
    text-decoration: underline;
  }

  .DC-note > * {
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
    border-radius: var(--radius);
    box-shadow: 0 0 7px rgba(0, 0, 0, 0.25);
    position: relative;
    font-size: 0;
    overflow: hidden;
    margin: 10px auto;
  }

  .DC-note-image-max-bounds.public {
    border: var(--annotationBorderWidth) solid var(--annotationBorder);
  }

  .DC-note-image-max-bounds.organization {
    border: var(--annotationBorderWidth) solid var(--organizationAnnotation);
  }

  .DC-note-image-max-bounds.private {
    border: var(--annotationBorderWidth) solid var(--privateAnnotation);
  }

  .DC-note-image-aspect-ratio {
    position: relative;
    overflow: hidden;
    height: 0;
    max-width: 100%;
  }
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
  }

  .DC-note-image-link img {
    margin: 0 !important;
    border: 0 !important;
    outline: 0 !important;
    max-width: none !important;
    max-height: none !important;
    display: block !important;
    position: absolute;
    height: auto;
    transform-origin: top left;
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
</style>
