<script lang="ts">
  import type { Highlight } from "$lib/api/types";

  /*
  {
  "page_no_1": [
      ". - Suite 1402 West Tower - Atlanta, GA 30334\nEffective as of\n\n01/31/2016\n\nSherry <em>Boston</em>\nP.O. "
    ]
  }
  */
  export let highlight: Highlight;
</script>

{#each Object.entries(highlight) as [page, segments]}
  <h4>{page}</h4>
  <blockquote class="highlight">
    {#each segments as segment}
      <p class="segment">{@html segment}</p>
    {/each}
  </blockquote>
{/each}

<style>
  .segment :global(em) {
    background-color: var(--yellow);
  }
</style>
