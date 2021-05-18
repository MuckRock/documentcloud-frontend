<script>
  import Tooltip from "@/common/Tooltip";
  import { layout } from "@/viewer/layout";
  import { handlePlural } from "@/util/string";

  $: maxHits =
    $layout.searchPages == null
      ? null
      : Math.max($layout.searchPages.map((page) => page.count));
</script>

<style lang="scss">
  em {
    color: $searchSpecial;
  }
</style>

{#if $layout.searchPages != null}
  <div>
    <b>
      Your query
      <em>{$layout.search}</em>
      was found on {handlePlural($layout.searchPages.length, "page")}
    </b>

    <div class="hist">
      {#each $layout.searchPages as page}
        <div class="page">{page.page} {page.count}</div>
      {/each}
    </div>
  </div>
{/if}
