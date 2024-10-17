<!-- @component
Provides context for its children. Useful as a parent of Viewer in
layouts, stories, and tests.
 -->
<script lang="ts" context="module">
  import { getContext, onMount, setContext } from "svelte";
  import {
    derived,
    get,
    type Readable,
    type Writable,
    writable,
  } from "svelte/store";
  import { afterNavigate } from "$app/navigation";

  import type {
    Maybe,
    Nullable,
    Document,
    DocumentText,
    Note,
    ViewerMode,
    Zoom,
  } from "@/lib/api/types";
  import {
    pageFromHash,
    pdfUrl,
    shouldPaginate,
    shouldPreload,
  } from "@/lib/api/documents";

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

  export function getDocument(): Document {
    return get(getContext("document"));
  }

  export function getText(): Maybe<DocumentText> {
    return get(getContext("text"));
  }

  export function getAssetUrl(): URL {
    return get(getContext("asset_url"));
  }

  export function getQuery(): string {
    return get(getContext("query") ?? writable(""));
  }

  export function isEmbedded(): boolean {
    // are we embedded?
    return get(getContext("embed") ?? writable(false));
  }

  export function getCurrentNote(): Readable<Note> {
    return get(getContext("currentNote"));
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
  import type { _ } from "svelte-i18n";
  import { noteFromHash } from "@/lib/api/notes";

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

  // to react to prop changes, values need to be a writable store
  const stores = {
    document: writable(document),
    text: writable(text),
    note: writable(note),
    asset_url: writable(asset_url),
    embed: writable(embed),
    page: writable(page),
    mode: writable(mode),
    query: writable(query),
    zoom: writable(zoom),
  };
  // when a prop changes, update its stored value
  $: stores.document.set(document);
  $: stores.text.set(text);
  $: stores.note.set(note);
  $: stores.asset_url.set(asset_url);
  $: stores.embed.set(embed);
  $: stores.page.set(page);
  $: stores.mode.set(mode);
  $: stores.query.set(query);
  $: stores.zoom.set(zoom);
  // stores we need deeper in the component tree, available via context
  setContext("document", stores.document);
  setContext("text", stores.text);
  setContext("asset_url", stores.asset_url);
  setContext("embed", stores.embed);
  setContext("query", stores.query);
  setContext("currentNote", stores.note);
  setContext("currentPage", stores.page);
  setContext("currentMode", stores.mode);
  setContext("zoom", stores.zoom);
  setContext("progress", progress);
  setContext("pdf", pdf);

  $: currentDoc = getDocument();
  $: currentMode = getCurrentMode();
  $: currentPage = getCurrentPage();
  $: currentNote = getCurrentNote();

  $: noteMatchingPageHash = (note: Note) =>
    note.id === noteFromHash($pageStore.url.hash);

  function scrollToHash(hash: string) {
    const page: Nullable<number> = pageFromHash(hash);
    const el: Maybe<HTMLElement> = window?.document.getElementById(
      hash.split("#")[1],
    );
    // Scroll to the element, if it's available, and update the current page
    if (el && page) {
      el.scrollIntoView();
      $currentPage = page;
    }
  }

  function onHashChange() {
    console.log(
      "onHashChange:",
      JSON.stringify(
        {
          w: window.location.hash,
          $: $pageStore.url.hash,
        },
        null,
        2,
      ),
    );
    const { hash } = window.location;
    $currentNote = currentDoc.notes.find(noteMatchingPageHash);
    if (shouldPaginate($currentMode)) {
      scrollToHash(hash);
    }
  }

  onMount(() => {
    // we might move this to a load function
    if (!task) {
      task = pdfjs.getDocument({ url: asset_url });
      $pdf = task.promise;
    }

    task.onProgress = (p: DocumentLoadProgress) => {
      $progress = p;
    };
  });

  afterNavigate(() => {
    console.log(
      "afterNavigate:",
      JSON.stringify(
        {
          w: window.location.hash,
          $: $pageStore.url.hash,
          s: JSON.stringify($pageStore.state, null, 2),
        },
        null,
        2,
      ),
    );
    // refresh stores from URL state
    const { hash } = $pageStore.url;
    $currentMode = mode;
    $currentNote = currentDoc.notes.find(noteMatchingPageHash) ?? null;
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
