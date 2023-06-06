<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  export let has_next = false;
  export let has_previous = false;

  const dispatch = createEventDispatcher();

  export function previous() {
    dispatch("previous");
  }

  export function next() {
    dispatch("next");
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
  <button class="previous" disabled={!has_previous} on:click={previous}>
    {$_("paginator.previous")}
  </button>

  <button class="next" disabled={!has_next} on:click={next}>
    {$_("paginator.next")}
  </button>
</div>
