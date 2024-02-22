<script>
  import { doc } from "@/viewer/document.js";
  import { viewer } from "@/viewer/viewer.js";
  import Paginator from "../../../common/Paginator.svelte";

  function goToPage(readablePageNumber) {
    doc.jumpToPage(readablePageNumber - 1);
  }

  $: {
    console.log(doc.visiblePageNumber, $doc.visiblePageNumber);
  }
</script>

{#if $viewer.loaded && $doc.mode !== "search" && $doc.mode !== "notes" && $doc.mode !== "thumbnail"}
  <Paginator
    bind:page={$doc.visiblePageNumber}
    totalPages={$viewer.document.pageCount}
    on:previous={goToPage}
    on:next={goToPage}
    on:goTo={goToPage}
    goToNav
    has_next={$doc.visiblePageNumber < $viewer.document.pageCount}
    has_prev={$doc.visiblePageNumber > 1}
  />
{/if}
