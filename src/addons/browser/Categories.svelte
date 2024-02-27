<script lang="ts">
  import { _ } from "svelte-i18n";
  import { filter, CATEGORIES } from "./browser";
  import Filter from "./Filter.svelte";
</script>

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
