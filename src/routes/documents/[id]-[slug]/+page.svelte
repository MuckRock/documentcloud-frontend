<script lang="ts">
  import type { Sizes, ViewerMode } from "@/lib/api/types.js";

  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import { _ } from "svelte-i18n";

  // icons
  import DocumentIcon from "@/common/icons/Document.svelte";
  import NotesIcon from "@/common/icons/Notes.svelte";
  import TextIcon from "@/common/icons/Text.svelte";
  import ThumbnailsIcon from "@/common/icons/Thumbnails.svelte";

  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Paginator from "@/common/Paginator.svelte";
  import PDF from "$lib/components/documents/PDF.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import TextPage from "$lib/components/documents/TextPage.svelte";
  import ThumbnailGrid from "$lib/components/documents/ThumbnailGrid.svelte";

  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";

  export let data;

  const modes = new Map([
    ["document", $_("mode.document")],
    ["text", $_("mode.text")],
    ["thumbnails", $_("mode.thumbnails")],
    ["notes", $_("mode.notes")],
  ]);

  const icons = {
    document: DocumentIcon,
    text: TextIcon,
    thumbnails: ThumbnailsIcon,
    notes: NotesIcon,
  };

  // internal state
  let currentPage = 1;

  $: document = data.document;
  $: mode = data.mode;
  $: text = data.text;
  $: zoom = getDefaultZoom(mode);
  $: zoomLevels = getZoomLevels(mode);

  function setMode(e) {
    const mode = e.target.value;
    const u = new URL($page.url);

    u.searchParams.set("mode", mode);

    goto(u);
  }

  // pagination
  function next() {
    currentPage = Math.min(currentPage + 1, document.page_count);
  }

  function previous() {
    currentPage = Math.max(currentPage - 1, 1);
  }

  // scroll to a page
  function scrollToPage(n: number) {
    currentPage = n;
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

    if (mode === "thumbnails") {
      return "small";
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

    if (mode === "text") {
      return [
        [0.5, "50%"],
        [0.75, "75%"],
        [1, "100%"],
        [1.25, "125%"],
        [1.5, "150%"],
        [2, "200%"],
      ];
    }

    if (mode === "thumbnails") {
      return [
        ["thumbnail", $_("zoom.thumbnail")],
        ["small", $_("zoom.small")],
        ["normal", $_("zoom.normal")],
        ["large", $_("zoom.large")],
      ];
    }

    // todo: notes, maybe
    return [];
  }

  // for typescript
  function zoomToScale(zoom: any): number | "width" | "height" {
    if (zoom === "width" || zoom === "height") {
      return zoom;
    }

    return +zoom || 1;
  }

  function zoomToSize(zoom: any): Sizes {
    if (IMAGE_WIDTHS_MAP.has(zoom)) {
      return zoom;
    }

    return "small";
  }
</script>

<ContentLayout>
  <PageToolbar slot="header">
    <Search slot="center" />
  </PageToolbar>

  {#if mode === "document"}
    <PDF {document} scale={zoomToScale(zoom)} asset_url={data.asset_url} />
  {/if}

  {#if mode === "text"}
    {#await text then { pages }}
      <div class="textPages">
        {#each pages as { page, contents }}
          <TextPage {page} {contents} --zoom={zoom} />
        {/each}
      </div>
    {/await}
  {/if}

  {#if mode === "thumbnails"}
    <ThumbnailGrid {document} size={zoomToSize(zoom)} />
  {/if}

  <PageToolbar slot="footer">
    <label class="mode" slot="left">
      <span class="sr-only">Mode</span>
      <svelte:component this={icons[mode]} />
      <select name="mode" value={mode} on:change={setMode}>
        {#each modes.entries() as [value, name]}
          <option {value}>{name}</option>
        {/each}
      </select>
    </label>

    <svelte:fragment slot="center">
      {#if mode !== "thumbnails"}
        <Paginator
          goToNav
          on:goTo={(e) => scrollToPage(e.detail)}
          on:next={next}
          on:previous={previous}
          bind:page={currentPage}
          totalPages={document.page_count}
          has_next={currentPage < document.page_count}
          has_previous={currentPage > 1}
        />
      {/if}
    </svelte:fragment>

    <label class="zoom" slot="right">
      {#if mode === "thumbnails"}
        {$_("zoom.size")}
      {:else}
        {$_("zoom.zoom")}
      {/if}
      <select name="zoom" bind:value={zoom}>
        {#each zoomLevels as [value, label]}
          <option {value}>{label}</option>
        {/each}
      </select>
    </label>
  </PageToolbar>
</ContentLayout>

<style>
  .textPages {
    max-width: 48rem;
    padding: 0 1rem;
    margin: 0 auto;
    width: 100%;
  }

  label.mode,
  label.zoom {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-m);
  }

  label.zoom select,
  label.mode select {
    border: none;
    font-family: var(--font-sans);
    font-size: var(--font-m);
  }

  label.zoom {
    justify-content: right;
  }
</style>
