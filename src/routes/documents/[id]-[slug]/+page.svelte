<script lang="ts">
  import type { Note, ViewerMode } from "@/lib/api/types.js";

  import { afterNavigate, goto, replaceState } from "$app/navigation";
  import { page } from "$app/stores";

  import { setContext } from "svelte";
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
  import Paginator, { currentPage } from "./components/ViewerPaginator.svelte";
  import PDF from "$lib/components/documents/PDF.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import Text from "$lib/components/documents/Text.svelte";
  import ThumbnailGrid from "$lib/components/documents/ThumbnailGrid.svelte";
  import Notes from "$lib/components/documents/Notes.svelte";
  import Zoom, {
    zoom,
    zoomToScale,
    zoomToSize,
  } from "./components/Zoom.svelte";

  // config and utils
  import { pageHashUrl, pageFromHash } from "$lib/api/documents";
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
  const mode: Writable<ViewerMode> = writable(data.mode);

  setContext("currentPage", currentPage);
  setContext("activeNote", activeNote);
  setContext("mode", mode);

  $: document = data.document;
  $: $mode = data.mode;
  $: query = data.query;
  $: text = data.text;

  // lifecycle
  afterNavigate(() => {
    const { hash } = $page.url;

    $currentPage = pageFromHash(hash);

    if ($currentPage > 1 && ["document", "text"].includes($mode)) {
      scrollToPage($currentPage);
    }

    const noteId = noteFromHash(hash);
    if (noteId) {
      $activeNote = document.notes.find((note) => note.id === noteId);
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
  {#if $mode === "document" || $mode === "notes"}
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
  <PageToolbar slot="header">
    <Search name="q" {query} slot="center" />
  </PageToolbar>

  {#if $mode === "document"}
    <PDF
      {document}
      scale={zoomToScale($zoom)}
      asset_url={data.asset_url}
      {query}
    />
  {/if}

  {#if $mode === "text"}
    <Text {text} zoom={+$zoom || 1} total={document.page_count} {query} />
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
      {#if $mode === "document" || $mode === "text"}
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
    font-size: var(--font-m);
  }

  label.mode select {
    border: none;
    font-family: var(--font-sans);
    font-size: var(--font-m);
  }
</style>
