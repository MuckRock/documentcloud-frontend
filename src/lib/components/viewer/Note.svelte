<!--
  @component
  A single note, either overlaid on a document or on its own.

  It can use *either* a loaded PDF or a document image to render
  a document excerpt.

  Assumes it's a child of a ViewerContext
-->
<script lang="ts">
  import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
  import type { User } from "@/api/types/orgAndUser";
  import type { Document, Note, Sizes } from "$lib/api/types";

  import DOMPurify from "isomorphic-dompurify";
  import { createEventDispatcher, onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    Globe16,
    Lock16,
    Pencil16,
    People16,
    Share16,
    XCircle16,
  } from "svelte-octicons";

  import { ALLOWED_ATTR, ALLOWED_TAGS } from "@/config/config.js";
  import { width, height, isPageLevel, noteHashUrl } from "$lib/api/notes";
  import { pageImageUrl } from "$lib/api/documents";
  import Portal from "../layouts/Portal.svelte";
  import Modal from "../layouts/Modal.svelte";
  import Share from "../documents/Share.svelte";
  import { getUserName } from "@/lib/api/accounts";
  import {
    getCurrentMode,
    getDocument,
    getPDF,
    isEmbedded,
  } from "$lib/components/viewer/ViewerContext.svelte";
  import { getViewerHref } from "$lib/utils/viewer";
  import Button from "../common/Button.svelte";

  const documentStore = getDocument();
  const pdf = getPDF();
  const embed = isEmbedded();
  const mode = getCurrentMode();

  const dispatch = createEventDispatcher();

  export let note: Note;
  export let scale = 2;

  type AsyncPDF = typeof $pdf;

  const SIZE: Sizes = "large";

  const access = {
    private: {
      value: $_("access.private.value"),
      title: $_("access.private.title"),
      icon: Lock16,
    },
    organization: {
      value: $_("access.organization.value"),
      title: $_("access.organization.title"),
      icon: People16,
    },
    public: {
      value: $_("access.public.value"),
      title: $_("access.public.title"),
      icon: Globe16,
    },
  };

  let canvas: HTMLCanvasElement;
  let rendering: Promise<any>;

  let shareNoteOpen = false;

  $: document = $documentStore;
  $: page_level = isPageLevel(note);
  $: page_number = note.page_number + 1; // note pages are 0-indexed
  $: user = typeof note.user === "object" ? (note.user as User) : null;
  $: rendering = render(canvas, document, $pdf); // avoid re-using the same canvas
  $: edit_link = getViewerHref({ document, note, mode: "annotating" });
  $: canEdit = note.edit_access && !embed;

  async function render(
    canvas: HTMLCanvasElement,
    document: Document,
    pdf: AsyncPDF,
  ) {
    if (!canvas) return;
    if (rendering) {
      await rendering;
    }

    if (pdf) {
      const resolvedPdf = await pdf;
      return renderPDF(canvas, resolvedPdf);
    }

    if (document && !pdf) {
      return renderImage(canvas, document);
    }

    // we don't have a pdf or a document, for some reason
    console.error(`Can't render note ${note.id} on page ${page_number}.`);
  }

  async function renderImage(canvas: HTMLCanvasElement, document: Document) {
    const context = canvas.getContext("2d");
    const image = new Image();

    let src = pageImageUrl(document, page_number, SIZE);
    /* not sure we need this
    if (document.access !== "public") {
      src = await getPrivateAsset(src);
    }
    */

    image.src = src.href;
    image.addEventListener("load", (e) => {
      canvas.width = width(note) * image.width;
      canvas.height = height(note) * image.height;
      context.drawImage(
        image,
        note.x1 * image.width,
        note.y1 * image.height,
        width(note) * image.width,
        height(note) * image.height,
        0,
        0,
        width(note) * image.width,
        height(note) * image.height,
      );
    });
  }

  async function renderPDF(canvas: HTMLCanvasElement, pdf: PDFDocumentProxy) {
    const context = canvas.getContext("2d");
    const page = await pdf.getPage(page_number);
    const [x, y, w, h] = page.view;

    const offsetX = note.x1 * w * scale;
    const offsetY = note.y1 * h * scale;
    const noteWidth = width(note) * w * scale;
    const noteHeight = height(note) * h * scale;
    const viewport = page.getViewport({
      scale,
      offsetX: -offsetX,
      offsetY: -offsetY,
    });

    const dpr = window?.devicePixelRatio ?? 1;
    const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;

    // set the pixel dimensions of the canvas
    canvas.width = Math.floor(noteWidth * dpr);
    canvas.height = Math.floor(noteHeight * dpr);

    const renderTask = page.render({
      canvasContext: context,
      viewport,
      transform,
    });

    return renderTask.promise;
  }

  function clean(html: string) {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS,
      ALLOWED_ATTR,
    });
  }

  function closeNote() {
    dispatch("close");
  }
</script>

<div
  class="note {note.access} {$mode || 'notes'}"
  class:page_level
  style:--x1={note.x1}
  style:--x2={note.x2}
  style:--y1={note.y1}
  style:--y2={note.y2}
  style:--note-width={width(note)}
  style:--note-height={height(note)}
>
  <header>
    {#if !page_level && $mode === "document"}
      <Button minW={false} ghost on:click={closeNote}>
        <XCircle16 />
      </Button>
    {/if}
    <div class="headerText">
      <h3>{note.title}</h3>
      {#if user}
        <p class="author">
          {$_("annotation.by", { values: { name: getUserName(user) } })}
        </p>
      {/if}
    </div>
  </header>
  {#if !page_level}
    <div class="highlight">
      <canvas width="0" height="0" bind:this={canvas}></canvas>
    </div>
  {/if}
  <div class="content">
    <p>{@html clean(note.content)}</p>
  </div>
  <footer>
    <span class="access {note.access}">
      <svelte:component this={access[note.access].icon} />
      {$_(`access.${access[note.access].value}.title`)}
    </span>
    <div class="actions">
      {#if canEdit}
        <Button ghost minW={false} mode="primary" size="small" href={edit_link}>
          <Pencil16 />
          {$_("dialog.edit")}
        </Button>
      {/if}
      <Button
        ghost
        minW={false}
        mode="primary"
        size="small"
        on:click={() => (shareNoteOpen = true)}
      >
        <Share16 />
        {$_("dialog.share")}
      </Button>
    </div>
  </footer>
</div>
{#if shareNoteOpen}
  <Portal>
    <Modal on:close={() => (shareNoteOpen = false)}>
      <h1 slot="title">{$_("dialog.share")}</h1>
      <Share {document} note={note.id} currentTab="note" />
    </Modal>
  </Portal>
{/if}

<style>
  .note {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    pointer-events: all;
    position: relative;
    scroll-margin-top: 6rem;
    z-index: var(--z-note);
  }

  /* page-level */
  .note.page_level {
    position: relative;
    width: 100%;
    z-index: inherit;
  }

  header {
    display: flex;
    align-items: center;
    align-self: stretch;
    gap: 0.5rem;
  }

  .headerText {
    flex: 1 1 auto;
    display: flex;
    align-items: baseline;
    gap: 1rem;
  }

  h3 {
    flex: 0 1 auto;
    text-align: left;
    font-weight: var(--font-semibold);
  }

  .actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--font-md, 1rem);
  }

  .highlight {
    align-self: stretch;
    border-radius: 0.5rem;
    border: 2px solid var(--gray-2, #d8dee2);
    background: var(--gray-1, #f5f6f7);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .public .highlight {
    border-color: var(--yellow-3);
  }

  .private .highlight {
    border-color: var(--blue-3);
  }

  .organization .highlight {
    border-color: var(--green-3);
  }

  .content {
    line-height: 1.5;
    font-size: var(--font-md);
  }

  .author {
    font-size: var(--font-xs);
    color: var(--gray-5);
  }

  canvas {
    max-width: 100%;
    padding: 1rem;
  }

  footer {
    display: flex;
    gap: 1rem;
    align-items: center;
    align-self: stretch;
  }

  span.access {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
  }

  span.access.public {
    fill: var(--yellow-3);
    color: var(--yellow-4);
  }

  span.access.organization {
    fill: var(--green-3);
    color: var(--green-4);
  }

  span.access.private {
    color: var(--blue-4);
    fill: var(--blue-3);
  }
</style>
