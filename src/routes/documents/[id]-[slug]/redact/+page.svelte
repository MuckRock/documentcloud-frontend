<script lang="ts">
  import type { Note, Sizes, ViewerMode } from "$lib/api/types";

  import { afterNavigate, replaceState } from "$app/navigation";
  import { page } from "$app/stores";

  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import { _ } from "svelte-i18n";

  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Paginator from "@/common/Paginator.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import PDF from "$lib/components/documents/PDF.svelte";

  import { pageHashUrl, pageFromHash } from "$lib/api/documents";
  import { noteFromHash } from "$lib/api/notes";
  import { scrollToPage } from "$lib/utils/scroll";

  export let data;

  // stores we need deeper in the component tree, available via context
  const currentPage: Writable<number> = writable(1);
  const activeNote: Writable<Note> = writable(null);
  const mode: Writable<ViewerMode> = writable("document"); // only ever one mode on this route

  setContext("currentPage", currentPage);
  setContext("activeNote", activeNote);
  setContext("mode", mode);

  $: asset_url = data.asset_url;
  $: document = data.document;
  $: zoom = getDefaultZoom($mode);
  $: zoomLevels = getZoomLevels($mode);

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

  // pagination
  function next() {
    $currentPage = Math.min($currentPage + 1, document.page_count);
    scrollToPage($currentPage);
    replaceState(pageHashUrl($currentPage), {});
  }

  function previous() {
    $currentPage = Math.max($currentPage - 1, 1);
    scrollToPage($currentPage);
    replaceState(pageHashUrl($currentPage), {});
  }

  function gotoPage(n: number) {
    $currentPage = n;
    scrollToPage($currentPage);
    replaceState(pageHashUrl($currentPage), {});
  }

  function onHashChange(e: HashChangeEvent) {
    const { hash } = new URL(e.newURL);
    $currentPage = pageFromHash(hash);
    scrollToPage($currentPage);

    const noteId = noteFromHash(hash);
    if (noteId) {
      $activeNote = document.notes.find((note) => note.id === noteId);
    }
  }

  /**
   * Generate a default zoom, based on mode
   * @param mode
   */
  function getDefaultZoom(
    mode: ViewerMode,
  ): number | Sizes | "width" | "height" {
    if (mode === "document") {
      return "width";
    }

    return 1;
  }

  /**
   * Generate zoom levels based on mode, since each zooms in a slightly different way
   */
  function getZoomLevels(mode: ViewerMode): (string | number)[][] {
    if (mode === "document") {
      return [
        ["width", $_("zoom.fitWidth")],
        ["height", $_("zoom.fitHeight")],
        [0.5, "50%"],
        [0.75, "75%"],
        [1, "100%"],
        [1.25, "125%"],
        [1.5, "150%"],
        [2, "200%"],
      ];
    }

    return [];
  }

  // for typescript
  function zoomToScale(zoom: any): number | "width" | "height" {
    if (zoom === "width" || zoom === "height") {
      return zoom;
    }

    return +zoom || 1;
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
  <PDF {document} {asset_url} scale={zoomToScale(zoom)} />

  <PageToolbar slot="footer">
    <svelte:fragment slot="left">
      <div>
        <!-- additional controls here -->
      </div>
    </svelte:fragment>
    <svelte:fragment slot="center">
      <Paginator
        goToNav
        on:goTo={(e) => gotoPage(e.detail)}
        on:next={next}
        on:previous={previous}
        bind:page={$currentPage}
        totalPages={document.page_count}
        has_next={$currentPage < document.page_count}
        has_previous={$currentPage > 1}
      />
    </svelte:fragment>

    <svelte:fragment slot="right">
      {#if zoomLevels.length}
        <label class="zoom">
          {$_("zoom.zoom")}
          <select name="zoom" bind:value={zoom}>
            {#each zoomLevels as [value, label]}
              <option {value}>{label}</option>
            {/each}
          </select>
        </label>
      {/if}
    </svelte:fragment>
  </PageToolbar>
</ContentLayout>

<style>
  label.zoom {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-m);
  }

  label.zoom select {
    border: none;
    font-family: var(--font-sans);
    font-size: var(--font-m);
  }

  label.zoom {
    justify-content: right;
  }
</style>
