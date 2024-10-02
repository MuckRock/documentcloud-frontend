<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Note, ViewerMode } from "$lib/api/types.js";

  import { afterNavigate, invalidate } from "$app/navigation";
  import { page } from "$app/stores";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import DocumentLayout from "$lib/components/layouts/DocumentLayout.svelte";

  // config and utils
  import {
    shouldPreload,
    pageFromHash,
    shouldPaginate,
  } from "$lib/api/documents";
  import { noteFromHash } from "$lib/api/notes";
  import { scrollToPage } from "$lib/utils/scroll";

  export let data;

  const activeNote: Writable<Note> = getContext("activeNote");
  const currentMode: Writable<ViewerMode> = getContext("currentMode");
  const currentPage: Writable<number> = getContext("currentPage");

  $: document = data.document;
  $: asset_url = data.asset_url;
  $: query = data.query;
  $: text = data.text;
  $: action = data.action;
  $: $currentMode = data.mode; // set $currentMode from URL search param
  $: addons = data.pinnedAddons;

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

  // go to page
  function onHashChange() {
    const { hash } = window.location;
    $currentPage = pageFromHash(hash);
    scrollToPage($currentPage);

    const noteId = noteFromHash(hash);
    if (noteId) {
      $activeNote = document.notes.find((note) => note.id === noteId);
    }
  }
</script>

<svelte:window on:hashchange={onHashChange} on:popstate={onHashChange} />
<svelte:head>
  {#if shouldPreload($currentMode)}
    <link
      rel="prefetch"
      href={data.asset_url.href}
      as="fetch"
      crossorigin="anonymous"
      type="application/pdf"
    />
  {/if}
</svelte:head>

<DocumentLayout {document} {asset_url} {text} {query} {action} {addons} />
