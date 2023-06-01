<script context="module">
  import { writable } from "svelte/store";
  import { _ } from "svelte-i18n";

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
</script>

<style>
  ul {
    list-style: none;
    margin-block-start: 0;
    padding-inline-start: 0;
  }

  ul li {
    margin: 0.25em;
  }

  ul li label {
    cursor: pointer;
  }

  ul li::before {
    content: "# ";
  }

  :checked + span {
    background-color: var(--highlight, #ff785c);
  }
</style>

<div class="categories">
  <h3>{$_("addonBrowserDialog.categories")}</h3>

  <ul>
    {#each CATEGORIES as category}
      <li>
        <label>
          <input type="checkbox" value={category} bind:group={$selected} />
          <span>{category}</span>
        </label>
      </li>
    {/each}
  </ul>
</div>
