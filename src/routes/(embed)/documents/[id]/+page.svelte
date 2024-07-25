<!-- COPIED FROM /documents/[id]-[slug] -->
<!-- TODO: CONSOLIDATE VIEWER RENDERING LOGIC -->

<script lang="ts">
  import type { Note, ViewerMode } from "@/lib/api/types.js";

  import { afterNavigate, goto, invalidate } from "$app/navigation";
  import { page } from "$app/stores";

  import { afterUpdate, getContext, setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import { _ } from "svelte-i18n";

  // icons
  import DocumentIcon from "@/common/icons/Document.svelte";
  import NotesIcon from "@/common/icons/Notes.svelte";
  import TextIcon from "@/common/icons/Text.svelte";
  import GridIcon from "@/common/icons/Grid.svelte";

  // components
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import PDF from "$lib/components/documents/PDF.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import Text from "$lib/components/documents/Text.svelte";
  import ThumbnailGrid from "$lib/components/documents/ThumbnailGrid.svelte";
  import Notes from "$lib/components/documents/Notes.svelte";
  import Zoom, {
    zoom,
    zoomToScale,
    zoomToSize,
  } from "../../../documents/[id]-[slug]/components/Zoom.svelte";
  import Paginator, { currentPage } from "../../../documents/[id]-[slug]/components/ViewerPaginator.svelte";

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

  export let data;

  const modes = new Map([
    ["document", $_("mode.document")],
    ["text", $_("mode.text")],
    ["grid", $_("mode.grid")],
    ["notes", $_("mode.notes")],
  ]);

  const icons = {
    document: DocumentIcon,
    text: TextIcon,
    grid: GridIcon,
    notes: NotesIcon,
  };

  // stores we need deeper in the component tree, available via context
  // const currentPage: Writable<number> = writable(1);
  const activeNote: Writable<Note> = writable(null);
  const mode: Writable<ViewerMode> = getContext("mode");

  setContext("currentPage", currentPage);
  setContext("activeNote", activeNote);

  $: document = data.document;
  $: $mode = data.mode;
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

  function setMode(e) {
    const mode = e.target.value;
    const u = new URL($page.url);

    u.searchParams.set("mode", mode);

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

<ContentLayout>
  {#if $mode === "document"}
    <PDF
      {document}
      scale={zoomToScale($zoom)}
      asset_url={data.asset_url}
    />
  {/if}

  {#if $mode === "text"}
    <Text {text} zoom={+$zoom || 1} total={document.page_count} />
  {/if}

  {#if $mode === "grid"}
    <ThumbnailGrid {document} size={zoomToSize($zoom)} />
  {/if}

  {#if $mode === "notes"}
    <Notes {document} asset_url={data.asset_url} />
  {/if}

  <PageToolbar slot="footer">
    <label class="mode" slot="left">
      <span class="sr-only">Mode</span>
      <svelte:component this={icons[$mode]} />
      <select name="mode" value={$mode} on:change={setMode}>
        {#each modes.entries() as [value, name]}
          <option {value}>{name}</option>
        {/each}
      </select>
    </label>

    <svelte:fragment slot="center">
      {#if shouldPaginate($mode)}
        <Paginator totalPages={document.page_count} />
      {/if}
    </svelte:fragment>

    <Zoom slot="right" mode={$mode} />
  </PageToolbar>
</ContentLayout>

<style>
  label.mode {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-md);
  }

  label.mode select {
    border: none;
    font-family: var(--font-sans);
    font-size: var(--font-md);
  }
</style>
