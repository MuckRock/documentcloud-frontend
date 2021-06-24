<script>
  import Tooltip from "@/common/Tooltip";
  import { layout } from "@/viewer/layout";
  import { handlePlural } from "@/util/string";
  import { _ } from "svelte-i18n";

  $: maxHits =
    $layout.searchPages == null
      ? null
      : Math.max($layout.searchPages.map((page) => page.count));
</script>

<style lang="scss">
  .searchpane {
    :global(em) {
      color: $searchSpecial;
    }
  }
</style>

{#if $layout.searchPages != null}
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
