<!-- @component
ViewerPaginator wraps the common paginator with viewer-specific state and functions
-->
<script context="module" lang="ts">
  import { writable, type Writable } from "svelte/store";

  import { replaceState } from "$app/navigation";
  import { pageHashUrl } from "$lib/api/documents";
  import { scrollToPage } from "$lib/utils/scroll";

  export const currentPage: Writable<number> = writable(1);
</script>

<script lang="ts">
  import Paginator from "@/common/Paginator.svelte";

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
