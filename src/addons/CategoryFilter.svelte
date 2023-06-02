<script context="module">
  import { writable } from "svelte/store";

  export const CATEGORIES = [
    "Import",
    "Export",
    "AI",
    "OCR",
    "Analysis",
    "Editing",
    "Visualization",
  ];

  export const selected = writable([]);
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
    {#each CATEGORIES as category}
      <li class:selected={$selected.includes(category)}>
        <label>
          <input type="checkbox" value={category} bind:group={$selected} />
          <span>{category}</span>
        </label>
      </li>
    {/each}
  </ul>
</div>
