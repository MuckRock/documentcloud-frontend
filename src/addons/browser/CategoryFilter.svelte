<script context="module">
  import { writable } from "svelte/store";
  import Filter from "./Filter.svelte";

  // todo put these somewhere easier to find
  export const CATEGORIES = [
    ["export", "Export"],
    ["ai", "AI"],
    ["bulk", "Bulk"],
    ["extraction", "Extraction"],
    ["file", "File"],
    ["monitor", "Monitor"],
    ["statistical", "Statistical"],
  ];

  export const categories = writable([]);
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
</script>

<style>
  ul {
    list-style: none;
    margin-block-start: 0;
    padding-inline-start: 0;
  }

  ul li {
    margin-bottom: 0.25em;
  }

  h3 {
    margin: 0.5em;
  }
</style>

<div class="categories">
  <h3>{$_("addonBrowserDialog.categories")}</h3>
  <ul>
    {#each CATEGORIES as [category, name]}
      <li>
        <Filter name={name} selected={$categories.includes(category)}>
          <input slot="checkbox" type="checkbox" value={category} bind:group={$categories} />
          <span slot="icon">#</span>
        </Filter>
      </li>
    {/each}
  </ul>
</div>
