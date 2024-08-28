<!-- @component documents/Paginator.svelte
Wraps the common paginator with viewer-specific state and functions
-->

<script lang="ts">
  import { currentPage } from "@/lib/stores/viewer";
  import { replaceState } from "$app/navigation";
  import { pageHashUrl } from "$lib/api/documents";
  import { scrollToPage } from "$lib/utils/scroll";
  import Paginator from "$lib/components/common/Paginator.svelte";

  export let totalPages: number;

  // pagination
  function next() {
    $currentPage = Math.min($currentPage + 1, totalPages);
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
</script>

<Paginator
  goToNav
  on:goTo={(e) => gotoPage(e.detail)}
  on:next={next}
  on:previous={previous}
  bind:page={$currentPage}
  {totalPages}
  has_next={$currentPage < totalPages}
  has_previous={$currentPage > 1}
/>
