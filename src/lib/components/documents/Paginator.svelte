<!-- @component documents/Paginator.svelte
Wraps the common paginator with viewer-specific state and functions
-->

<script lang="ts">
  import type { Writable } from "svelte/store";
  import { getContext } from "svelte";

  import { replaceState } from "$app/navigation";

  import Paginator from "$lib/components/common/Paginator.svelte";

  import { pageHashUrl } from "$lib/api/documents";
  import { scrollToPage } from "$lib/utils/scroll";

  export let totalPages: number;

  const currentPage: Writable<number> = getContext("currentPage");

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
