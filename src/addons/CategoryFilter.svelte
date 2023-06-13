<script context="module">
  import { writable } from "svelte/store";

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
    padding: 0.25em;
  }

  ul li label {
    cursor: pointer;
  }

  ul li::before {
    content: "# ";
  }

  .selected {
    background-color: var(--highlight-orange, #ff785c);
    border: 1px solid var(--gray);
    border-radius: var(--radius, 4px);
  }
</style>

<div class="categories">
  <h3>{$_("addonBrowserDialog.categories")}</h3>

  <ul>
    {#each CATEGORIES as [category, name]}
      <li class:selected={$categories.includes(category)}>
        <label>
          <input type="checkbox" value={category} bind:group={$categories} />
          <span>{name}</span>
        </label>
      </li>
    {/each}
  </ul>
</div>
