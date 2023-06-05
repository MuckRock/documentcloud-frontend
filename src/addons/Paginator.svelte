<script context="module">
  import { writable } from "svelte/store";

  export const current_page = writable(1);
</script>

<script lang="ts">
  import { beforeUpdate, createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  export let total: number = 0;
  export let per_page: number = 5;

  const dispatch = createEventDispatcher();

  $: pages = total > 0 ? total / per_page : 0;

  beforeUpdate(() => {
    if ($current_page > pages) {
      $current_page = pages;
    } else if ($current_page < 1) {
      $current_page = 1;
    }
  });

  export function previous() {
    $current_page -= 1;
    dispatch("previous", { page: $current_page });
  }

  export function next() {
    $current_page += 1;
    dispatch("next", { page: $current_page });
  }

  export function goto(n: number) {
    $current_page = n;
  }
</script>

<style>
  .paginator {
    display: flex;
    justify-content: space-around;
    position: relative;
    width: 100%;
  }
</style>

<div class="paginator">
  <button class="previous" disabled={$current_page <= 0} on:click={previous}>
    {$_("paginator.previous")}
  </button>

  <span class="text">
    Page {$current_page} of {pages}
  </span>

  <button class="next" disabled={$current_page >= total} on:click={next}>
    {$_("paginator.next")}
  </button>
</div>
