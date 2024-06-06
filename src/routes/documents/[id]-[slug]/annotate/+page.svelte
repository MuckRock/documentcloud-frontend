<script lang="ts">
  import type { Note, ViewerMode } from "$lib/api/types";

  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";

  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import { _ } from "svelte-i18n";

  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Paginator, { currentPage } from "../components/ViewerPaginator.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import PDF from "$lib/components/documents/PDF.svelte";
  import Zoom, { zoom, zoomToScale } from "../components/Zoom.svelte";

  import { pageFromHash } from "$lib/api/documents";
  import { noteFromHash } from "$lib/api/notes";
  import { scrollToPage } from "$lib/utils/scroll";

  export let data;

  // stores we need deeper in the component tree, available via context
  const activeNote: Writable<Note> = writable(null);
  const mode: Writable<ViewerMode> = writable("document"); // only ever one mode on this route

  setContext("activeNote", activeNote);
  setContext("mode", mode);

  $: asset_url = data.asset_url;
  $: document = data.document;

  // lifecycle
  afterNavigate(() => {
    const { hash } = $page.url;

    $currentPage = pageFromHash(hash);

    if ($currentPage > 1) {
      scrollToPage($currentPage);
    }

    const noteId = noteFromHash(hash);
    if (noteId) {
      $activeNote = document.notes.find((note) => note.id === noteId);
    }
  });

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
  <link
    rel="preload"
    href={asset_url.href}
    as="fetch"
    crossorigin="anonymous"
    type="application/pdf"
  />
</svelte:head>

<ContentLayout>
  <PDF {document} {asset_url} scale={zoomToScale($zoom)} />

  <PageToolbar slot="footer">
    <svelte:fragment slot="left">
      <div>
        <!-- additional controls here -->
      </div>
    </svelte:fragment>

    <Paginator slot="center" totalPages={document.page_count} />

    <Zoom slot="right" mode={$mode} />
  </PageToolbar>
</ContentLayout>
