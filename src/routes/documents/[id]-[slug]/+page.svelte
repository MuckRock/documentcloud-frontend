<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import { ThreeBars16 } from "svelte-octicons";

  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Paginator from "@/common/Paginator.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import TextPage from "$lib/components/documents/TextPage.svelte";

  export let data;

  const modes = new Map([
    ["document", "Document"],
    ["text", "Text"],
    ["thumbnails", "Thumbnails"],
    ["notes", "Notes"],
  ]);

  // internal state
  let currentPage = 1;

  $: document = data.document;
  $: mode = modes.has(data.mode) ? data.mode : "document";
  $: text = data.text;

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
</script>

<ContentLayout>
  <PageToolbar slot="header">
    <Search slot="center" />
  </PageToolbar>

  {#if mode === "text"}
    {#await text then { pages }}
      {#each pages as { page, contents }}
        <TextPage {page} {contents} />
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
  </PageToolbar>
</ContentLayout>

<style>
  label.mode {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  select[name="mode"] {
    border: none;
  }
</style>
