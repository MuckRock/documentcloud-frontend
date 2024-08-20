<script lang="ts">
  import type { ViewerMode } from "@/lib/api/types.js";

  import { afterNavigate, goto, invalidate } from "$app/navigation";
  import { page } from "$app/stores";
  import { currentPage, activeNote } from "@/lib/stores/viewer";

  import { afterUpdate, getContext, setContext } from "svelte";
  import { type Writable } from "svelte/store";
  import { _ } from "svelte-i18n";

  // config and utils
  import { POLL_INTERVAL } from "@/config/config.js";
  import {
    pageHashUrl,
    pageFromHash,
    shouldPaginate,
    shouldPreload,
  } from "$lib/api/documents";
  import { noteFromHash } from "$lib/api/notes";
  import { scrollToPage } from "$lib/utils/scroll";
  import Viewer from "@/lib/components/documents/Viewer.svelte";
  import DocumentMetadata from "@/lib/components/documents/sidebar/DocumentMetadata.svelte";
  import Data from "@/lib/components/documents/sidebar/Data.svelte";
  import Projects from "../sidebar/Projects.svelte";

  export let data;

  // stores we need deeper in the component tree, available via context
  // const currentPage: Writable<number> = writable(1);
  const mode: Writable<ViewerMode> = getContext("mode");

  setContext("currentPage", currentPage);
  setContext("activeNote", activeNote);

  $: document = data.document;
  $: $mode = data.mode;
  $: query = data.query;
  $: text = data.text;

  // lifecycle
  afterNavigate(() => {
    const { hash } = $page.url;

    $currentPage = pageFromHash(hash);

    if ($currentPage > 1 && shouldPaginate($mode)) {
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

  $: {
    const u = new URL($page.url);

    u.searchParams.set("mode", $mode);

    // reset hash, keeping page number
    u.hash = "";
    if ($currentPage > 1) {
      u.hash = pageHashUrl($currentPage);
    }

    goto(u);
  }

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
  {#if shouldPreload($mode)}
    <link
      rel="preload"
      href={data.asset_url.href}
      as="fetch"
      crossorigin="anonymous"
      type="application/pdf"
    />
  {/if}
</svelte:head>

<DocumentMetadata {document} />
<Viewer bind:mode={$mode} {document} {text} {query} />
