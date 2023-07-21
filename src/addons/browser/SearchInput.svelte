<script context="module">
  import { writable } from "svelte/store";
  import Search from "../../common/icons/Search.svelte";

  export const query = writable("");
</script>

<style>
  .search {
    display: flex;
    align-items: center;
    border-radius: calc(2 * var(--radius));
    border: 1px solid rgba(0, 0, 0, 0.25);
    /* box-shadow: inset 0 0 2px var(--darkgray); */
    padding: 0 0.5em;
  }
  .search:focus-within {
    outline: 2px solid blue;
  }
  input {
    width: 100%;
    appearance: none;
    border: none;
    box-shadow: none;
    background: transparent;
  }
  input:focus {
    outline: none;
  }
</style>

<label class="search">
  <Search size={0.8} />
  <input
    type="search"
    bind:value={$query}
    aria-label="Search Add-Ons"
    placeholder="Search"
  />
</label>
