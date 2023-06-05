<script context="module">
  import { writable } from "svelte/store";

  export const query = writable("");
</script>

<style>
</style>

<div class="search">
  <input
    type="search"
    bind:value={$query}
    aria-label="Search Add-Ons"
    placeholder="Search"
  />
</div>
