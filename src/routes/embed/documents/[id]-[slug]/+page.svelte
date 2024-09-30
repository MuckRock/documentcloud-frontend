<!-- COPIED FROM /documents/[id]-[slug] -->
<!-- TODO: CONSOLIDATE VIEWER RENDERING LOGIC -->

<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Note, ViewerMode } from "@/lib/api/types.js";

  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";

  import { getContext } from "svelte";
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

  export let data;

  const currentMode: Writable<ViewerMode> = getContext("currentMode");
  const currentPage: Writable<number> = getContext("currentPage");
  const activeNote: Writable<Note> = getContext("activeNote");

  $: document = data.document;
  $: text = data.text;
  $: $currentMode = data.mode; // set $currentMode from URL search param

  $: console.log($currentPage);
  $: console.log($page.url);

  // lifecycle
  afterNavigate(() => {
    console.log($page.url.href);
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
  function onHashChange(e: HashChangeEvent) {
    console.log(e);
    const { hash } = new URL(e.newURL);
    console.log(hash);
    $currentPage = pageFromHash(hash);
    scrollToPage($currentPage);

    const noteId = noteFromHash(hash);
    if (noteId) {
      $activeNote = document.notes.find((note) => note.id === noteId);
    }
  }
</script>

<svelte:window on:hashchange={onHashChange} on:popstate={console.log} />
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
  <DocumentEmbed settings={data.settings} {document} {text} />
</EmbedLayout>
