<script lang="ts">
  import { doc } from "../../../viewer/document.js";
  import { viewer } from "../../../viewer/viewer.js";
  import Paginator from "../../../common/Paginator.svelte";

  // @ts-expect-error
  $: mode = doc.mode;

  $: page = doc.visiblePageNumber;
  $: totalPages = viewer.document?.pageCount;
  $: has_next = page < totalPages;
  $: has_previous = page > 1;
  $: {
    console.debug({ page, totalPages, has_next, has_previous });
  }

  function goToPage(event: CustomEvent) {
    const page = event.detail;
    console.debug("Go to page ", page);
    doc.jumpToPage(page - 1);
  }
</script>

{#if $viewer.loaded && mode !== "search" && mode !== "notes" && mode !== "thumbnail"}
  <Paginator
    {page}
    {totalPages}
    {has_next}
    {has_previous}
    on:previous={goToPage}
    on:next={goToPage}
    on:goTo={goToPage}
    goToNav
  />
{/if}
