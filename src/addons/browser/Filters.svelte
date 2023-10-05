<script context="module">
  import { writable } from "svelte/store";
  export const filter = writable("featured");
  // TODO declare hardcoded values in a centralized place
  export const FILTERS = [
    ["all", "All"],
    ["active", "Pinned"],
    ["featured", "Featured"],
    ["premium", "Premium"],
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
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";

  import Filter from "./Filter.svelte";
  import Pin from "../../common/icons/Pin.svelte";
  import Star from "../../common/icons/Star.svelte";
  import Infinity from "svelte-octicons/lib/Infinity16.svelte";
  import Credit from "../../common/icons/Credit.svelte";
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

  #all [slot="icon"] {
    display: flex;
    align-items: center;
  }

  #all:not(.selected) [slot="icon"] {
    fill: var(--primary);
  }

  #pinned:not(.selected) [slot="icon"] {
    fill: palevioletred;
  }

  #featured:not(.selected) [slot="icon"] {
    fill: orange;
  }

  #premium:not(.selected) [slot="icon"] {
    fill: var(--premium);
  }
</style>

<ul class="filters">
  <li id="all" class:selected={$filter.includes("all")}>
    <Filter name="All" selected={$filter.includes("all")}>
      <input slot="input" type="radio" value="all" bind:group={$filter} />
      <span slot="icon"><Infinity /></span>
    </Filter>
  </li>
  <li id="featured" class:selected={$filter.includes("featured")}>
    <Filter name="Featured" selected={$filter.includes("featured")}>
      <input slot="input" type="radio" value="featured" bind:group={$filter} />
      <span slot="icon"><Star /></span>
    </Filter>
  </li>
  <li id="pinned" class:selected={$filter.includes("active")}>
    <Filter name="Pinned" selected={$filter.includes("active")}>
      <input slot="input" type="radio" value="active" bind:group={$filter} />
      <span slot="icon"><Pin /></span>
    </Filter>
  </li>
  <li id="premium" class:selected={$filter.includes("premium")}>
    <Filter name="Premium" selected={$filter.includes("premium")}>
      <input slot="input" type="radio" value="premium" bind:group={$filter} />
      <span slot="icon"><Credit badge /></span>
    </Filter>
  </li>
</ul>
<div class="categories">
  <h3>{$_("addonBrowserDialog.categories")}</h3>
  <ul>
    {#each CATEGORIES as [category, name]}
      <li class="category" class:selected={$filter.includes(category)}>
        <Filter {name} selected={$filter.includes(category)}>
          <input
            slot="input"
            type="radio"
            value={category}
            bind:group={$filter}
          />
        </Filter>
      </li>
    {/each}
  </ul>
</div>
