<script>
  import { doc } from "@/viewer/document.js";
  import { viewer } from "@/viewer/viewer.js";
  import Paginator from "../../../common/Paginator.svelte";

  function gotoPage(readablePageNumber) {
    doc.jumpToPage(readablePageNumber - 1);
  }

  function increment() {
    gotoPage(Math.min(doc.visiblePageNumber + 1, viewer.document.pageCount));
  }

  function decrement() {
    gotoPage(Math.max(doc.visiblePageNumber - 1, 1));
  }
</script>

{#if $viewer.loaded && $doc.mode !== "search" && $doc.mode !== "notes" && $doc.mode !== "thumbnail"}
  <Paginator
    page={$doc.visiblePageNumber}
    totalPages={$viewer.document.pageCount}
    on:previous={decrement}
    on:next={increment}
    on:goTo={gotoPage}
    goToNav
    has_next={$doc.visiblePageNumber < $viewer.document.pageCount}
    has_prev={$doc.visiblePageNumber > 1}
  />
{/if}
