<!-- @component
Provides context for its children. Useful as a parent of Viewer in
layouts, stories, and tests.
 -->
<script lang="ts" context="module">
  import { getContext, onMount, setContext } from "svelte";
  import { get, type Writable, writable } from "svelte/store";
  import { afterNavigate } from "$app/navigation";

  import type {
    Maybe,
    Nullable,
    Document,
    DocumentText,
    Note,
    ViewerMode,
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
</script>

<script lang="ts">
  import { page as pageStore } from "$app/stores";
  import type { _ } from "svelte-i18n";

  export let document: Document;
  export let text: Maybe<DocumentText> = undefined;
  export let asset_url: URL = pdfUrl(document);
  export let embed: boolean = false;
  export let page: number = 1;
  export let mode: ViewerMode = "document";
  export let note: Nullable<Note> = null;
  export let query: string = "";

  // https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFDocumentProxy.html
  export let pdf: Writable<Promise<pdfjs.PDFDocumentProxy>> = writable(
    new Promise(() => {}),
  );
  let task: Maybe<Nullable<pdfjs.PDFDocumentLoadingTask>> = null;

  const progress = writable<DocumentLoadProgress>({
    loaded: 0,
    total: 0,
  });

  // stores we need deeper in the component tree, available via context
  setContext("document", document);
  setContext("text", text);
  setContext("asset_url", asset_url);
  setContext("embed", embed);
  setContext("query", query);
  setContext("currentPage", writable(page));
  setContext("currentMode", writable(mode));
  setContext("progress", progress);
  setContext("pdf", pdf);

  $: currentMode = getCurrentMode();
  $: currentPage = getCurrentPage();

  function scrollToHash(hash: string) {
    const page: Nullable<number> = pageFromHash(hash);
    const el: Maybe<HTMLElement> = window?.document.querySelector(hash);
    // Scroll to the element, if it's available, and update the current page
    if (el && page) {
      el.scrollIntoView();
      $currentPage = page;
    }
  }

  function onHashChange() {
    const { hash } = window.location;
    scrollToHash(hash);
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
    const { hash } = $pageStore.url;
    if (shouldPaginate($currentMode)) {
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
