<!-- @component
A single page of a PDF document.
This component exists to manage state and rendering for a single page,
working with PDF.svelte.

Selectable text can be rendered in one of two ways:
- Extracted from the PDF page (preferred)
- Passed in as a server-fetched JSON object
-->
<script lang="ts">
  import type { Writable } from "svelte/store";
  import type {
    Document,
    Note as NoteType,
    Section,
    TextPosition,
    ViewerMode,
  } from "$lib/api/types";

  import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    Share16,
    Comment16,
    ListOrdered16,
    KebabHorizontal16,
  } from "svelte-octicons";

  // page parts
  import AnnotationPane from "./AnnotationPane.svelte";
  import Note from "./Note.svelte";
  import NotesPane from "./NotesPane.svelte";
  import Page from "./Page.svelte";
  import RedactionLayer, { pending, redactions } from "./RedactionLayer.svelte";

  // writable ui
  import Action from "../common/Action.svelte";
  import Button from "../common/Button.svelte";
  import Dropdown from "@/lib/components/common/Dropdown.svelte";
  import EditNote from "../forms/EditNote.svelte";
  import EditSections from "../forms/EditSections.svelte";
  import Flex from "../common/Flex.svelte";
  import Menu from "$lib/components/common/Menu.svelte";
  import MenuItem from "$lib/components/common/MenuItem.svelte";
  import Modal from "../layouts/Modal.svelte";
  import Share from "../documents/Share.svelte";
  import Portal from "../layouts/Portal.svelte";

  import { highlight } from "$lib/utils/search";
  import { isPageLevel } from "$lib/api/notes";
  import { remToPx } from "@/lib/utils/layout";
  import { isEmbedded } from "@/lib/utils/viewer";

  export let document: Document;
  export let page_number: number; // 1-indexed
  export let pdf; // Promise<PDFDocumentProxy>

  export let scale: number | "width" | "height";
  export let width: number;
  export let height: number;

  export let query: string = ""; // search query
  export let notes: NoteType[] = [];
  export let section: Section = undefined; // one at most
  export let text: TextPosition[] = [];
  export let embed = isEmbedded();

  // make hidden things visible, for debugging
  export let debug = false;

  // share page
  let pageShareOpen = false;

  const mode: Writable<ViewerMode> = getContext("currentMode");

  let canvas: HTMLCanvasElement;
  let container: HTMLElement;
  let textContainer: HTMLElement;

  // keep track of this to avoid overlapping renders
  let renderTask;
  let textPromise: Promise<void>; // resolves when text is rendered
  let loaded = false;
  let textLayer; // TextLayer

  // visibility, for loading optimization
  let visible: boolean = false;

  let editSection = false;
  let pageNote = false;

  function close() {
    editSection = false;
    pageNote = false;
  }

  $: aspect = height / width;
  $: orientation = height > width ? "vertical" : "horizontal";
  $: numericScale = fitPage(width, height, container, scale);

  // render when anything changes
  $: page =
    visible && Promise.resolve(pdf).then((pdf) => pdf?.getPage(page_number));

  // we need to wait on both promises to render on initial load
  $: Promise.all([pdf, page]).then(([pdf, page]) => {
    render(page, canvas, container, scale);
    textPromise = renderTextLayer(page, textContainer, container, scale);
  });

  $: textPromise?.then(() => {
    markHighlights(textContainer, query);
  });

  // handle 0 sizing when page_spec is unavailable
  $: if (page && width === 0 && height === 0) {
    page.then((p) => {
      width = p.view[2];
      height = p.view[3];
    });
  }

  $: redactions_for_page = [...$pending, ...$redactions].filter(
    (r) => r.page_number === page_number - 1,
  );

  $: page_level_notes = notes?.filter((n) => isPageLevel(n)) ?? [];
  $: in_page_notes = notes?.filter((n) => !isPageLevel(n)) ?? [];

  /**
   * Return a numeric scale based on intrinsic page size and container size
   * @param width Original document width
   * @param height Original document height
   * @param container
   * @param scale
   */
  function fitPage(
    width: number,
    height: number,
    container: HTMLElement,
    scale: number | "width" | "height",
  ): number {
    if (typeof scale === "number") return scale;
    if (!container) return 1;

    // const [x1, y1, width, height] = page.view;
    const { clientWidth, clientHeight } = container;

    return scale === "width" ? clientWidth / width : clientHeight / height;
  }

  async function render(
    page, // pdf.getPage
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    scale: number | "width" | "height",
  ) {
    // only one render task at a time;
    if (renderTask) {
      await renderTask.promise;
    }

    // check that we have things
    if (![canvas, container, scale, page].every(Boolean)) return;

    const numericScale = fitPage(width, height, container, scale);
    const context = canvas.getContext("2d");
    const viewport = page.getViewport({ scale: numericScale });
    const dpr = window?.devicePixelRatio ?? 1;

    const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;

    // set the pixel dimensions of the canvas
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);

    // set the container size, if using a numeric zoom
    if (typeof scale === "number") {
      container.style.setProperty("--width", Math.floor(viewport.width) + "px");
    }

    // store the task, return the promise
    renderTask = page.render({
      canvasContext: context,
      viewport,
      transform,
    });
    loaded = true;
    return renderTask.promise;
  }

  async function renderTextLayer(
    page, // PdfPageProxy
    textContainer: HTMLElement,
    pageContainer: HTMLElement,
    scale: number | "width" | "height",
  ) {
    if (text.length > 0) return;
    if (!textContainer) return;

    if (!page) return;

    const numericScale = fitPage(width, height, pageContainer, scale);
    const viewport = page.getViewport({ scale: numericScale });
    const content = await page.getTextContent();

    // svelte's reactivity ends up a step behind, so do this here
    container.style.setProperty("--scale-factor", numericScale.toFixed(2));

    textLayer = new pdfjs.TextLayer({
      textContentSource: content,
      container: textContainer,
      viewport,
    });

    return textLayer.render();
  }

  function markHighlights(textContainer: HTMLElement, query: string) {
    if (!query || !textContainer) return;
    container.querySelectorAll("span").forEach((span) => {
      if (span.textContent) {
        span.innerHTML = highlight(span.textContent, query);
      }
    });
  }

  function onResize() {
    numericScale = fitPage(width, height, container, scale);
  }

  function onVisibilityChange() {
    if (window.document.visibilityState === "visible" && !canvas.hidden) {
      Promise.all([pdf, page]).then(([pdf, page]) => {
        render(page, canvas, container, scale);
      });
    }
  }

  let pageWidth: number;
  $: id = `page_${page_number}`;
</script>

<svelte:window on:resize={onResize} />

<svelte:document on:visibilitychange={onVisibilityChange} />

<Page
  {document}
  {page_number}
  {embed}
  wide={scale === "width"}
  tall={scale === "height"}
  track
  let:visible
  on:visible={() => {
    visible = true;
  }}
  bind:width={pageWidth}
>
  <svelte:fragment slot="title">
    {#if section}
      <h3 class="section">
        {section.title}
      </h3>
    {/if}
  </svelte:fragment>

  <div slot="actions">
    {#if !embed}
      {#if pageWidth > remToPx(32) || !document.edit_access}
        <Flex align="center">
          <Action icon={Share16} on:click={() => (pageShareOpen = true)}>
            {$_("dialog.share")}
          </Action>
          {#if document.edit_access}
            <div>
              <Action icon={Comment16} on:click={() => (pageNote = true)}>
                {$_("annotate.cta.add-note")}
              </Action>

              <Action
                icon={ListOrdered16}
                on:click={() => (editSection = true)}
              >
                {#if section}
                  {$_("annotate.cta.edit-section")}
                {:else}
                  {$_("annotate.cta.add-section")}
                {/if}
              </Action>
            </div>
          {/if}
        </Flex>
      {:else}
        <Dropdown position="bottom-end">
          <Button minW={false} slot="anchor" ghost mode="primary">
            <KebabHorizontal16 />
          </Button>
          <Menu slot="default" let:close>
            <MenuItem
              on:click={() => {
                close();
                pageShareOpen = true;
              }}
            >
              <Share16 slot="icon" />
              {$_("dialog.share")}
            </MenuItem>
            {#if document.edit_access}
              <MenuItem
                on:click={() => {
                  close();
                  pageNote = true;
                }}
              >
                <Comment16 slot="icon" />
                {$_("annotate.cta.add-note")}
              </MenuItem>

              <MenuItem
                on:click={() => {
                  close();
                  editSection = true;
                }}
              >
                <ListOrdered16 slot="icon" />
                {#if section}
                  {$_("annotate.cta.edit-section")}
                {:else}
                  {$_("annotate.cta.add-section")}
                {/if}
              </MenuItem>
            {/if}
          </Menu>
        </Dropdown>
      {/if}
    {/if}
  </div>

  {#if page_level_notes.length}
    <div class="page-notes">
      {#each page_level_notes as note}
        <Note {document} {note} />
      {/each}
    </div>
  {/if}

  <div
    bind:this={container}
    class="page-container scale-{scale} {orientation}"
    class:visible
    class:debug
    style:--aspect={aspect}
    style:--scale-factor={numericScale.toFixed(2)}
    style:--width="{width}px"
    style:--height="{height}px"
    data-loaded={loaded}
  >
    <canvas bind:this={canvas} {width} {height}></canvas>

    {#if text.length > 0}
      <div bind:this={textContainer} class="selectable-text">
        {#each text as word}
          <span
            role="presentation"
            class="word"
            style="left: {word.x1 * 100}%; top: {word.y1 * 100}%;"
            >{word.text}</span
          >
        {/each}
      </div>
    {:else}
      <div bind:this={textContainer} class="selectable-text embedded">
        <!-- pdfjs.renderTextLayer will fill this in -->
      </div>
    {/if}

    {#if $mode === "annotating"}
      <AnnotationPane
        {document}
        notes={in_page_notes}
        page_number={page_number - 1}
      />
    {:else}
      {#await pdf then pdf}
        <NotesPane
          {document}
          notes={in_page_notes}
          {pdf}
          scale={numericScale}
        />
      {/await}
    {/if}

    {#if redactions_for_page.length > 0 || $mode === "redacting"}
      <RedactionLayer
        page_number={page_number - 1}
        active={$mode === "redacting"}
      />
    {/if}
  </div>
</Page>
{#if pageShareOpen}
  <Portal>
    <Modal on:close={() => (pageShareOpen = false)}>
      <h1 slot="title">{$_("dialog.share")}</h1>
      <Share {document} page={page_number} currentTab="page" />
    </Modal>
  </Portal>
{/if}
{#if editSection}
  <Portal>
    <Modal on:close={close}>
      <h2 slot="title">
        {#if section}
          {$_("annotate.cta.edit-section")}
        {:else}
          {$_("annotate.cta.add-section")}
        {/if}
      </h2>
      <EditSections
        {document}
        on:close={close}
        section={section || { page_number: page_number - 1 }}
      />
    </Modal>
  </Portal>
{/if}
{#if pageNote}
  <Portal>
    <Modal on:close={close}>
      <h2 slot="title">
        {$_("annotate.cta.add-note")}
      </h2>
      <EditNote {document} page_number={page_number - 1} on:close={close} />
    </Modal>
  </Portal>
{/if}

<style>
  .section {
    color: var(--gray-4);
    font-weight: var(--font-semibold);
    max-width: 66ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .page-container {
    aspect-ratio: 1 / var(--aspect);
    margin: 0;
    position: relative;

    background-color: var(--white, white);
    box-shadow: var(--shadow-1);
    width: var(--width, "100%");
  }

  .page-container.scale-width {
    width: 100%;
  }

  .page-container.scale-height {
    aspect-ratio: 1 / var(--aspect);
    height: 90vh;
    width: inherit;
  }

  .page-notes {
    display: flex;
    flex-flow: column nowrap;
    gap: 1rem;
    width: 100%;
    margin-bottom: 1rem;
  }

  .selectable-text {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
  }

  .word {
    color: transparent;
    position: absolute;
  }

  .selectable-text.embedded {
    position: absolute;
    text-align: initial;
    inset: 0;
    overflow: hidden;
    opacity: 1;
    line-height: 1;
    -webkit-text-size-adjust: none;
    -moz-text-size-adjust: none;
    text-size-adjust: none;
    forced-color-adjust: none;
    transform-origin: 0 0;
    caret-color: CanvasText;
  }

  .selectable-text.embedded :global(:is(span, br)) {
    color: transparent;
    position: absolute;
    white-space: pre;
    cursor: text;
    transform-origin: 0% 0%;
  }

  .debug .selectable-text.embedded :global(:is(span, br)) {
    color: red;
  }

  .selectable-text :global(br) {
    user-select: none;
  }

  .selectable-text :global(mark) {
    background-color: var(--note-public, mark);
    color: transparent;
    opacity: 0.35;
  }

  canvas {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
  }

  /* pdfjs creates this */
  :global(.hiddenCanvasElement) {
    display: none;
  }
</style>
