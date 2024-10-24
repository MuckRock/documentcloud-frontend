<!-- @component
Provides context for its children. Useful as a parent of Viewer in
layouts, stories, and tests.
 -->
<script lang="ts" context="module">
  import type {
    Maybe,
    Nullable,
    Document,
    DocumentText,
    Note,
    ViewerMode,
    Zoom,
  } from "$lib/api/types";

  import { afterNavigate } from "$app/navigation";

  import { getContext, onMount, setContext } from "svelte";
  import { type Readable, type Writable, writable } from "svelte/store";

  import {
    pageFromHash,
    pdfUrl,
    shouldPaginate,
    shouldPreload,
  } from "$lib/api/documents";

  import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.mjs",
      import.meta.url,
    ).href;
  }

  interface DocumentLoadProgress {
    loaded: number;
    total: number;
  }

  export function getDocument(): Writable<Document> {
    return getContext("document");
  }

  export function getText(): Maybe<DocumentText> {
    return getContext("text");
  }

  export function getAssetUrl(): URL {
    return getContext("asset_url");
  }

  export function getQuery(): string {
    return getContext("query") ?? "";
  }

  export function isEmbedded(): boolean {
    // are we embedded?
    return getContext("embed") ?? false;
  }

  export function getCurrentNote(): Readable<Note> {
    return getContext("currentNote");
  }

  export function getCurrentPage(): Writable<number> {
    return getContext("currentPage");
  }

  export function getCurrentMode(): Writable<ViewerMode> {
    return getContext("currentMode");
  }

  export function getPDF(): Writable<Promise<pdfjs.PDFDocumentProxy>> {
    return getContext("pdf");
  }

  export function getPDFProgress(): Writable<DocumentLoadProgress> {
    return getContext("progress");
  }

  export function getZoom(): Writable<Zoom> {
    return getContext("zoom");
  }
</script>

<script lang="ts">
  import { page as pageStore } from "$app/stores";
  import { noteFromHash } from "$lib/api/notes";

  export let document: Document;
  export let text: Maybe<DocumentText> = undefined;
  export let note: Nullable<Note> = null;
  export let asset_url: URL = pdfUrl(document);
  export let embed: boolean = false;
  export let page: number = 1;
  export let mode: ViewerMode = "document";
  export let query: string = "";
  export let zoom: Zoom = 1;

  // https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFDocumentProxy.html
  export let pdf: Writable<Promise<pdfjs.PDFDocumentProxy>> = writable(
    new Promise(() => {}),
  );
  let task: Maybe<Nullable<pdfjs.PDFDocumentLoadingTask>> = null;

  const progress = writable<DocumentLoadProgress>({
    loaded: 0,
    total: 0,
  });

  // React to document changes
  const documentStore = writable(document);
  $: documentStore.set(document);

  // stores we need deeper in the component tree, available via context
  setContext("document", documentStore);
  setContext("text", text);
  setContext("asset_url", asset_url);
  setContext("embed", embed);
  setContext("query", query);
  setContext("currentNote", writable(note));
  setContext("currentPage", writable(page));
  setContext("currentMode", writable(mode));
  setContext("zoom", writable(zoom));
  setContext("progress", progress);
  setContext("pdf", pdf);

  $: currentDoc = getDocument();
  $: currentMode = getCurrentMode();
  $: currentPage = getCurrentPage();
  $: currentNote = getCurrentNote();

  $: noteMatchingPageHash = (note: Note) =>
    note.id === noteFromHash($pageStore.url.hash);

  function scrollToHash(hash?: string) {
    const page: Nullable<number> = pageFromHash(hash);
    let el: Maybe<HTMLElement>;
    if (hash) {
      el = window?.document.getElementById(hash.split("#")[1]);
    }
    // Scroll to the element, if it's available, and update the current page
    if (el && page) {
      el.scrollIntoView();
      $currentPage = page;
    }
  }

  function onHashChange() {
    const { hash } = window.location;
    $currentNote = $currentDoc.notes.find(noteMatchingPageHash);
    if (shouldPaginate($currentMode)) {
      scrollToHash(hash);
    }
  }

  onMount(() => {
    // we might move this to a load function
    if (!task) {
      task = pdfjs.getDocument({ url: asset_url });
      task.onProgress = (p: DocumentLoadProgress) => {
        $progress = p;
      };
      $pdf = task.promise;
    }
  });

  afterNavigate(() => {
    // refresh stores from URL state
    const { hash } = $pageStore.url;
    $currentMode = mode;
    $currentNote = $currentDoc.notes.find(noteMatchingPageHash) ?? null;
    if (shouldPaginate(mode)) {
      scrollToHash(hash);
    }
  });
</script>

<svelte:window on:hashchange={onHashChange} on:popstate={onHashChange} />
<svelte:head>
  {#if shouldPreload($currentMode)}
    <link
      rel="prefetch"
      href={asset_url.href}
      as="fetch"
      crossorigin="anonymous"
      type="application/pdf"
    />
  {/if}
</svelte:head>

<slot />
