<!-- TODO: CONSOLIDATE VIEWER LOGIC -->

<!-- @component
  Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";

  import { _ } from "svelte-i18n";

  import DocumentLayout from "$lib/components/layouts/DocumentLayout.svelte";
  import GuidedTour from "$lib/components/onboarding/GuidedTour.svelte";

  // config and utils
  import {
    shouldPreload,
    pageFromHash,
    shouldPaginate,
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

  $: action = data.action;
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

<DocumentLayout {action} {addons} />
<GuidedTour />
