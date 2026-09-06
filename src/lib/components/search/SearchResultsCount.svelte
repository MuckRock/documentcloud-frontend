<script lang="ts">
  import type { SearchResultsState } from "$lib/state/search.svelte";
  import { _ } from "svelte-i18n";

  let { search }: { search: SearchResultsState<any> } = $props();
</script>

{#if search.visible && search.total}
  <p>
    {$_("inputs.resultsCount", {
      values: { n: search.visible.size, total: search.total },
    })}
  </p>
{/if}

<style>
  p {
    flex: 1 1 auto;
    text-align: right;
    font-size: var(--font-sm);
    margin: 0.25rem 0.5rem;
  }
</style>
