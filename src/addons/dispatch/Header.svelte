<script lang="ts">
  import type { AddOnListItem } from "../browser/AddOnListItem.svelte";
  import { _ } from "svelte-i18n";

  export let addon: AddOnListItem;

  $: author = addon.author || addon.repository.split("/")[0];
</script>

<style>
  .description :global(a) {
    text-decoration: underline;
  }
</style>

<header>
  <a href="#add-ons" class="browser"
    >&larr; {$_("addonDispatchDialog.addons")}</a
  >

  <h2>{addon.name}</h2>

  <div class="metadata">
    <div class="author">
      <span>{$_("addonDispatchDialog.createdBy")}</span>
      <h3>{author}</h3>
    </div>

    <div class="categories">
      {#if addon.categories}
        <span>{$_("addonDispatchDialog.categories")}</span>
        <h3>{addon.categories.join(", ")}</h3>
      {/if}
    </div>
  </div>

  <div class="description">
    {@html addon.parameters.description}
  </div>

  <div class="buttons">
    <button class="share">Share</button>
    <a
      href="https://github.com/{addon.repository}"
      class="button"
      rel="noopener noreferrer"
      target="_blank">{$_("addonDispatchDialog.viewsource")}</a
    >
  </div>
</header>
