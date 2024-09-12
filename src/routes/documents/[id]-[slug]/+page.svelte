<script lang="ts">
  import { _ } from "svelte-i18n";
  import { onMount, afterUpdate, getContext } from "svelte";
  import { browser } from "$app/environment";
  import { afterNavigate, goto, invalidate } from "$app/navigation";
  import { page } from "$app/stores";

  // config and utils
  import { POLL_INTERVAL } from "@/config/config.js";
  import {
    pageHashUrl,
    shouldPaginate,
    shouldPreload,
  } from "$lib/api/documents";
  import { noteFromHash } from "$lib/api/notes";
  import type { Note, ViewerMode } from "$lib/api/types.js";
  import DocumentLayout from "@/lib/components/layouts/DocumentLayout.svelte";
  import type { Writable } from "svelte/store";

  export let data;

  let previousMode: ViewerMode;

  $: document = data.document;
  $: query = data.query;
  $: text = data.text;
  $: action = data.action;

  const activeNote: Writable<Note> = getContext("activeNote");
  const currentPage: Writable<number> = getContext("currentPage");
  const currentMode: Writable<ViewerMode> = getContext("currentMode");

  function setCurrentNoteFromHash(url: URL) {
    const { hash } = url;
    const noteId = noteFromHash(hash);
    if (noteId) {
      $activeNote = document.notes.find((note) => note.id === noteId);
    }
  }

  // Navigation Lifecycle
  afterNavigate(() => {
    setCurrentNoteFromHash($page.url);
  });

  // Pagination Lifecycle
  function onHashChange(e: HashChangeEvent) {
    setCurrentNoteFromHash(new URL(e.newURL));
  }

  // Component Lifecycle
  onMount(() => {
    // initialize state from data
    $currentMode = data.mode;
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

  $: if (browser) {
    const u = new URL($page.url);
    // When the mode changes, update the URL param to match.
    u.searchParams.set("mode", $currentMode);
    // Reset the hash, keeping page number if we should paginate.
    if (shouldPaginate($currentMode) && $currentPage > 1) {
      u.hash = pageHashUrl($currentPage);
    } else {
      u.hash = "";
    }
    // Only navigate when the mode changes.
    // Since we're accessing $page or $currentPage, this will run when
    // those values change, as well. We want to avoid unnecessary runs.
    if (previousMode !== $currentMode) {
      goto(u);
      previousMode = $currentMode;
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

<DocumentLayout {document} {text} {query} {action} />
