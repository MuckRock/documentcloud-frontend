<!-- COPIED FROM /documents/[id]-[slug] -->
<!-- TODO: CONSOLIDATE VIEWER LOGIC -->

<!-- @component
Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";

  import { _ } from "svelte-i18n";

  import DocumentEmbed from "@/lib/components/embeds/DocumentEmbed.svelte";
  import EmbedLayout from "@/lib/components/layouts/EmbedLayout.svelte";

  // config and utils
  import {
    canonicalUrl,
    pageFromHash,
    pdfUrl,
    shouldPaginate,
    shouldPreload,
  } from "$lib/api/documents";
  import { noteFromHash } from "$lib/api/notes";
  import { scrollToPage } from "$lib/utils/scroll";
  import {
    getActiveNote,
    getCurrentMode,
    getCurrentPage,
    getDocument,
  } from "@/lib/components/viewer/ViewerContext.svelte";

  export let data;

  const document = getDocument();
  const currentMode = getCurrentMode();
  const currentPage = getCurrentPage();
  const activeNote = getActiveNote();

  // lifecycle
  afterNavigate(() => {
    const { hash } = $page.url;

    $currentPage = pageFromHash(hash);

    if ($currentPage > 1 && shouldPaginate($currentMode)) {
      scrollToPage($currentPage);
    }

    const noteId = noteFromHash(hash);
    if (noteId) {
      $activeNote = document.notes.find((note) => note.id === noteId);
    }
  });

  // pagination
  function onHashChange(e: HashChangeEvent | PopStateEvent) {
    const { hash } = window.location;
    $currentPage = pageFromHash(hash);
    scrollToPage($currentPage);

    const noteId = noteFromHash(hash);
    if (noteId) {
      $activeNote = document.notes.find((note) => note.id === noteId);
    }
  }
</script>

<svelte:window on:hashchange={onHashChange} />
<svelte:head>
  {#if shouldPreload($currentMode)}
    <link
      rel="preload"
      href={data.asset_url.href}
      as="fetch"
      crossorigin="anonymous"
      type="application/pdf"
    />
  {/if}
</svelte:head>

<EmbedLayout
  settings={data.settings}
  canonicalUrl={canonicalUrl(document).href}
  downloadUrl={pdfUrl(document).href}
>
  <DocumentEmbed settings={data.settings} />
</EmbedLayout>
