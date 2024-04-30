<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import { ThreeBars16 } from "svelte-octicons";

  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Paginator from "@/common/Paginator.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import TextPage from "$lib/components/documents/TextPage.svelte";
  import type { ViewerMode } from "@/lib/api/types.js";

  export let data;

  const modes = new Map([
    ["document", "Document"],
    ["text", "Text"],
    ["thumbnails", "Thumbnails"],
    ["notes", "Notes"],
  ]);

  // internal state
  let currentPage = 1;
  let zoom = 1;

  $: document = data.document;
  $: mode = modes.has(data.mode) ? data.mode : "document";
  $: text = data.text;
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
   * Generate zoom levels based on mode, since each zooms in a slightly different way
   *
   * @param mode
   */
  function getZoomLevels(mode: ViewerMode): (string | number)[][] {
    if (mode === "document") {
      return [
        ["width", "Fit Width"],
        ["height", "Fit Height"],
        [0.5, "50%"],
        [0.75, "75%"],
        [1, "100%"],
        [1.5, "150%"],
        [2, "200%"],
      ];
    }

    if (mode === "text") {
      return [
        [0.5, "50%"],
        [0.75, "75%"],
        [1, "100%"],
        [1.5, "150%"],
        [2, "200%"],
      ];
    }

    // todo: thumbnails and notes, maybe
    return [];
  }
</script>

<ContentLayout>
  <PageToolbar slot="header">
    <Search slot="center" />
  </PageToolbar>

  {#if mode === "text"}
    {#await text then { pages }}
      {#each pages as { page, contents }}
        <TextPage {page} {contents} --zoom={zoom} />
      {/each}
    {/await}
  {/if}

  <PageToolbar slot="footer">
    <label class="mode" slot="left">
      <span class="sr-only">Mode</span>
      <ThreeBars16 />
      <select name="mode" value={mode} on:change={setMode}>
        {#each modes.entries() as [value, name]}
          <option {value}>{name}</option>
        {/each}
      </select>
    </label>

    <Paginator
      slot="center"
      goToNav
      on:goTo={(e) => scrollToPage(e.detail)}
      on:next={next}
      on:previous={previous}
      bind:page={currentPage}
      totalPages={document.page_count}
      has_next={currentPage < document.page_count}
      has_previous={currentPage > 1}
    />

    <label class="zoom" slot="right">
      Zoom
      <select name="zoom" bind:value={zoom}>
        {#each zoomLevels as [value, label]}
          <option {value}>{label}</option>
        {/each}
      </select>
    </label>
  </PageToolbar>
</ContentLayout>

<style>
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
  }

  label.zoom {
    justify-content: right;
  }
</style>
