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
    BBox,
  } from "$lib/api/types";

  import { afterNavigate } from "$app/navigation";

  import { getContext, onMount, setContext } from "svelte";
  import { type Writable, writable } from "svelte/store";

  import {
    pageFromHash,
    pdfUrl,
    shouldPaginate,
    assetUrl,
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

  export function getText(): Promise<Maybe<DocumentText>> {
    return getContext("text");
  }

  export function getAssetUrl(): URL {
    return getContext("asset_url");
  }

  export function isEmbedded(): boolean {
    // are we embedded?
    return getContext("embed") ?? false;
  }

  export function getNewNote(): Writable<Nullable<Partial<Note> & BBox>> {
    return getContext("newNote");
  }

  export function getCurrentNote(): Writable<Nullable<Note>> {
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

  export function getErrors(): Writable<Error[]> {
    return getContext("errors");
  }
</script>

<script lang="ts">
  import { page as pageStore } from "$app/stores";
  import { noteFromHash } from "$lib/api/notes";

  export let document: Document;
  export let text: Promise<Maybe<DocumentText>> = new Promise(() => {});
  export let note: Nullable<Note> = null;
  export let asset_url: URL = pdfUrl(document);
  export let embed: boolean = false;
  export let page: number = 1;
  export let mode: ViewerMode = "document";
  export let zoom: Zoom = 1;
  export let errors: Error[] = [];

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
  setContext("newNote", writable(null));
  setContext("currentNote", writable(note));
  setContext("currentPage", writable(page));
  setContext("currentMode", writable(mode));
  setContext("zoom", writable(zoom));
  setContext("progress", progress);
  setContext("pdf", pdf);
  setContext("errors", writable(errors));

  $: currentDoc = getDocument();
  $: currentMode = getCurrentMode();
  $: currentPage = getCurrentPage();
  $: currentNote = getCurrentNote();
  $: currentErrors = getErrors();

  $: noteMatchingPageHash = (note: Note) =>
    note.id === noteFromHash($pageStore.url.hash);

  function scrollToHash(hash?: string) {
    const page: Nullable<number> = hash ? pageFromHash(hash) : null;
    let el: Maybe<Nullable<HTMLElement>>;
    if (hash) {
      const id = hash.split("#")[1];
      if (id) {
        el = window?.document.getElementById(id);
      }
    }
    // Scroll to the element, if it's available, and update the current page
    if (el && page) {
      el.scrollIntoView();
      $currentPage = page;
    }
  }

  function onHashChange() {
    const { hash } = window.location;
    $currentNote = $currentDoc.notes?.find(noteMatchingPageHash) ?? null;
    if (shouldPaginate($currentMode)) {
      scrollToHash(hash);
    }
  }

  let retriesOn403Error = 0;
  function loadPDF(asset_url: URL) {
    if (!task) {
      task = pdfjs.getDocument({ url: asset_url });
      $pdf = task.promise;

      task.onProgress = (p: DocumentLoadProgress) => {
        $progress = p;
      };

      task.promise.catch(async (error) => {
        if (error.status === 403 && retriesOn403Error < 5) {
          // try to load the document again using a fresh asset_url
          const fresh_asset_url = await assetUrl(document);
          task = null;
          retriesOn403Error++;
          loadPDF(fresh_asset_url);
        } else {
          console.error(error);
          $currentErrors = [...$currentErrors, error];
          throw error;
        }
      });
    }
  }

  onMount(() => {
    // we might move this to a load function
    loadPDF(asset_url);
  });

  afterNavigate(() => {
    // refresh stores from URL state
    const { hash } = $pageStore.url;
    const hashPage = pageFromHash(hash);
    if (hashPage) {
      $currentPage = hashPage;
    }
    $currentMode = mode;
    $currentNote = $currentDoc.notes?.find(noteMatchingPageHash) ?? null;
    if (shouldPaginate(mode) && (hashPage || 0) > 1) {
      scrollToHash(hash);
    }
  });
</script>

<svelte:window on:hashchange={onHashChange} on:popstate={onHashChange} />

<slot />
