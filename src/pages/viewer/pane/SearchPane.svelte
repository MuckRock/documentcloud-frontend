<script>
  import { _ } from "svelte-i18n";
  import { layout } from "@/viewer/layout.js";
</script>

{#if $layout.searchPages !== null}
  <div class="searchpane">
    <b>
      {@html $_("searchPane.yourQuery", {
        values: { search: $layout.search, n: $layout.searchPages.length },
      })}
    </b>

    <div class="hist">
      {#each $layout.searchPages as page}
        <div class="page">{page.page} {page.count}</div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .searchpane :global(em) {
    color: var(--searchSpecial, #5a00ff);
  }
</style>
