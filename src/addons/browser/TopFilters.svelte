<script context="module">
  import { writable } from "svelte/store";
  import Filter from "./Filter.svelte";

  export const filters = writable([]);

  export const FILTERS = [
    ["Pinned", "active", "✓"],
    ["Featured", "featured", "*"],
  ];
</script>

<style>
  ul {
    list-style: none;
    margin-block-end: 0;
    padding-inline-start: 0;
  }

  ul li {
    margin-bottom: 0.25em;
  }
</style>

<ul>
  {#each FILTERS as [name, value, icon]}
    <li>
      <Filter name={name} selected={$filters.includes(value)}>
        <input slot="checkbox" type="checkbox" {value} bind:group={$filters} />
        <span slot="icon">{icon}</span>
      </Filter>
    </li>
  {/each}
</ul>
