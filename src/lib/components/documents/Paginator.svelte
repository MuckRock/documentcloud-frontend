<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  export let has_next = false;
  export let has_previous = false;
  export let total: number;
  export let page = 0;
  export let per_page = 12;
  export let things = "documents";

  const dispatch = createEventDispatcher();

  $: start = Math.max(page * per_page + 1, 1);
  $: end = Math.min(start + per_page - 1, total);

  export function previous() {
    dispatch("previous");
  }

  export function next() {
    dispatch("next");
  }
</script>

<div class="paginator">
  <button class="buttonLike" disabled={!has_previous} on:click={previous}>
    {$_("paginator.previous")}
  </button>

  <div class="numbers">
    <span class="start">{start}</span> - <span class="end">{end}</span> of
    <span class="total">{total}</span>
    <span class="things">{things}</span>
  </div>

  <button class="buttonLike" disabled={!has_next} on:click={next}>
    {$_("paginator.next")}
  </button>
</div>

<style>
  .paginator {
    display: flex;
    justify-content: space-between;
    position: relative;
    width: 100%;
  }
</style>
