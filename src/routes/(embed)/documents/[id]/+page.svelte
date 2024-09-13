<!-- COPIED FROM /documents/[id]-[slug] -->
<!-- TODO: CONSOLIDATE VIEWER RENDERING LOGIC -->

<script lang="ts">
  import type { Note } from "@/lib/api/types.js";

  import { afterNavigate, invalidate } from "$app/navigation";
  import { page } from "$app/stores";

  import { afterUpdate, getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { _ } from "svelte-i18n";

  // config and utils
  import { POLL_INTERVAL } from "@/config/config.js";
  import {
    canonicalUrl,
    pageFromHash,
    pdfUrl,
    shouldPaginate,
    shouldPreload,
  } from "$lib/api/documents";
  import { noteFromHash } from "$lib/api/notes";
  import { scrollToPage } from "$lib/utils/scroll";
  import EmbedLayout from "@/lib/components/layouts/EmbedLayout.svelte";
  import DocumentEmbed from "@/lib/components/embeds/DocumentEmbed.svelte";

  export let data;

  const currentPage: Writable<number> = getContext("currentPage");
  const activeNote: Writable<Note> = getContext("activeNote");

  $: document = data.document;
  $: mode = data.mode;
  $: text = data.text;

  // lifecycle
  afterNavigate(() => {
    const { hash } = $page.url;

    $currentPage = pageFromHash(hash);

    if ($currentPage > 1 && shouldPaginate(mode)) {
      scrollToPage($currentPage);
    }

    const noteId = noteFromHash(hash);
    if (noteId) {
      $activeNote = document.notes.find((note) => note.id === noteId);
    }
  });

  afterUpdate(() => {
    // todo: can we make this more granular? do other things trigger invalidation?
    // https://github.com/orgs/MuckRock/projects/14/views/1?pane=issue&itemId=68215069
    if (document.status === "pending" || document.status === "readable") {
      setTimeout(() => {
        invalidate(`document:${document.id}`);
      }, POLL_INTERVAL);
    }
  });

  // pagination
  function onHashChange(e: HashChangeEvent) {
    const { hash } = new URL(e.newURL);
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
  {#if shouldPreload(mode)}
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
