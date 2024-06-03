<!--
  @component
  A single note, either overlaid on a document or on its own.
  It has two states, focused and normal.

  It can use *either* a loaded PDF or a document image to render
  a document excerpt.
-->
<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { User } from "@/api/types/orgAndUser";
  import type { Document, Note, Sizes, ViewerMode } from "$lib/api/types";

  import { pushState } from "$app/navigation";

  import DOMPurify from "isomorphic-dompurify";
  import { getContext, onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    Globe16,
    Lock16,
    Pencil16,
    People16,
    Trash16,
  } from "svelte-octicons";
  import Action from "../common/Action.svelte";

  import { ALLOWED_ATTR, ALLOWED_TAGS } from "@/config/config.js";
  import { noteHashUrl, width, height } from "$lib/api/notes";
  import { pageImageUrl } from "$lib/api/documents";
  // import { getPrivateAsset } from "$lib/utils/api";

  export let note: Note;
  export let pdf = null; // PDFDocumentProxy
  export let scale = 1.5;

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

  const activeNote: Writable<Note> = getContext("activeNote");
  const document: Document = getContext("document");
  const mode: Writable<ViewerMode> = getContext("mode");

  let canvas: HTMLCanvasElement;
  let renderTask;
  let rendering;

  $: href = noteHashUrl(note);
  $: page_number = note.page_number + 1; // note pages are 0-indexed
  $: user = typeof note.user === "object" ? (note.user as User) : null;
  $: rendering = render(canvas, document, pdf); // avoid re-using the same canvas

  onMount(() => {
    rendering = render(canvas, document, pdf);
  });

  async function render(canvas: HTMLCanvasElement, document: Document, pdf) {
    if (!canvas) return;
    if (rendering) {
      await rendering;
    }

    if (pdf) {
      return renderPDF(canvas, pdf);
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

  async function renderPDF(canvas: HTMLCanvasElement, pdf) {
    if (renderTask) {
      await renderTask.promise;
    }

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

    renderTask = page.render({
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

  function onClick(e) {
    activeNote?.set(note);
    pushState(e.target.href, {});
  }
</script>

<div
  class="note focused {note.access} {$mode || 'notes'}"
  style:--x1={note.x1}
  style:--x2={note.x2}
  style:--y1={note.y1}
  style:--y2={note.y2}
  style:--note-width={width(note)}
  style:--note-height={height(note)}
>
  <header>
    <h3>{note.title}</h3>
    <div class="actions">
      {#if note.edit_access}
        <Action icon={Pencil16}>{$_("dialog.edit")}</Action>
        <Action --color="var(--red)" --fill="var(--red)" icon={Trash16}
          >{$_("dialog.delete")}</Action
        >
      {/if}
    </div>
  </header>
  <div class="highlight">
    <canvas width="0" height="0" bind:this={canvas}></canvas>
  </div>
  <div class="content">
    <p>{@html clean(note.content)}</p>
  </div>
  <footer>
    {#if note.edit_access}
      <label class="access">
        <svelte:component this={access[note.access].icon} />
        <span class="sr-only">{$_("access.access")}</span>
        <select name="access" value={note.access}>
          {#each Object.values(access) as opt}
            <option value={opt.value}>{opt.title}</option>
          {/each}
        </select>
      </label>
    {:else}
      <span class="access {note.access}">
        <svelte:component this={access[note.access].icon} />
        {$_(`access.${access[note.access].value}.title`)}
      </span>
    {/if}

    {#if user}
      <p class="author">
        {$_("annotation.by", { values: { name: user.name } })}
      </p>
    {/if}
  </footer>
</div>

<style>
  .note.focused {
    display: flex;
    padding: var(--font-xs, 0.75rem) var(--font-md, 1rem);
    flex-direction: column;
    align-items: flex-start;
    gap: var(--font-xs, 0.75rem);
    pointer-events: all;

    border-radius: 0.5rem;
    border: 1px solid var(--gray-2, #d8dee2);
    background: var(--white, #fff);

    /* shadow-2 */
    box-shadow: 0px 2px 8px 2px var(--shadow, rgba(30, 48, 56, 0.15));
  }

  /* overlay */
  .note.focused.document {
    display: flex;
    padding: 0.75rem 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;

    position: absolute;
    /* shift up to account for the note header */
    top: calc(var(--y1) * 100% - 3rem);
    /* left: calc(var(--x1) * 100% - 1px - var(--font-xs)); */
    left: 0;
    max-width: 100%; /* maybe should just be width: 100% */

    z-index: 10;
  }

  .focused header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
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
    border-color: var(--note-public);
  }

  .private .highlight {
    border-color: var(--note-private);
  }

  .organization .highlight {
    border-color: var(--note-org);
  }

  canvas {
    max-width: 100%;
    padding: 0.25rem;
  }

  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
  }

  footer p {
    color: var(--gray-4, #5c717c);
    font-size: var(--font-s);
  }

  label.access {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  label.access select {
    border: none;
    font-family: var(--font-sans);
    font-size: var(--font-s);
  }

  span.access {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-s);
  }

  span.access.public,
  .public label.access {
    fill: var(--note-public);
  }

  span.access.organization,
  .organization label.access {
    color: var(--note-org);
    fill: var(--note-org);
  }

  span.access.private {
    color: var(--note-private);
    fill: var(--note-private);
  }
</style>
