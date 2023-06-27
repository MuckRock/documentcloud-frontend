<script context="module">
  import { writable } from "svelte/store";
  import Filter from "./Filter.svelte";

  // TODO declare hardcoded values in a centralized place

  export const FILTERS = [
    ["Pinned", "active", "✓"],
    ["Featured", "featured", "*"],
  ];
  
  export const CATEGORIES = [
    ["export", "Export"],
    ["ai", "AI"],
    ["bulk", "Bulk"],
    ["extraction", "Extraction"],
    ["file", "File"],
    ["monitor", "Monitor"],
    ["statistical", "Statistical"],
  ];

  export const filters = writable([]);
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

<ul>
  {#each FILTERS as [name, value, icon]}
    <li>
      <Filter name={name} selected={$filters.includes(value)}>
        <input slot="input" type="checkbox" {value} bind:group={$filters} />
        <span slot="icon">{icon}</span>
      </Filter>
    </li>
  {/each}
</ul>
<div class="categories">
  <h3>{$_("addonBrowserDialog.categories")}</h3>
  <ul>
    {#each CATEGORIES as [category, name]}
      <li>
        <Filter name={name} selected={$categories.includes(category)}>
          <input slot="input" type="checkbox" value={category} bind:group={$categories} />
          <span slot="icon">#</span>
        </Filter>
      </li>
    {/each}
  </ul>
</div>

