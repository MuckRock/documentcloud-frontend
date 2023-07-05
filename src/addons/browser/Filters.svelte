<script context="module">
  import { writable } from "svelte/store";
  export const filters = writable([]);
  export const categories = writable([]);
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";

  import Filter from "./Filter.svelte";
  import Pin from "../../common/icons/Pin.svelte";
  import Star from "../../common/icons/Star.svelte";
  import Hashtag from "../../common/icons/Hashtag.svelte";

  // TODO declare hardcoded values in a centralized place

  export const FILTERS = [
    ["Pinned", "active"],
    ["Featured", "featured"],
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

  #pinned:not(.selected) [slot="icon"] {
    fill: palevioletred;
  }

  #featured:not(.selected) [slot="icon"] {
    fill: orange;
  }

  .categories [slot="icon"] {
    fill: lightgray;
  }
</style>

<ul class="filters">
  <li id="pinned" class:selected={$filters.includes("active")}>
    <Filter name="Pinned" selected={$filters.includes("active")}>
      <input
        slot="input"
        type="checkbox"
        value="active"
        bind:group={$filters}
      />
      <span slot="icon"><Pin /></span>
    </Filter>
  </li>
  <li id="featured" class:selected={$filters.includes("featured")}>
    <Filter name="Featured" selected={$filters.includes("featured")}>
      <input
        slot="input"
        type="checkbox"
        value="featured"
        bind:group={$filters}
      />
      <span slot="icon"><Star /></span>
    </Filter>
  </li>
</ul>
<div class="categories">
  <h3>{$_("addonBrowserDialog.categories")}</h3>
  <ul>
    {#each CATEGORIES as [category, name]}
      <li>
        <Filter {name} selected={$categories.includes(category)}>
          <input
            slot="input"
            type="checkbox"
            value={category}
            bind:group={$categories}
          />
          <span slot="icon"><Hashtag /></span>
        </Filter>
      </li>
    {/each}
  </ul>
</div>
