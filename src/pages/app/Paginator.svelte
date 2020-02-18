<script>
  import { search } from "@/search/search";
  import { pushUrl } from "@/router/router";
  import { queryBuilder } from "@/util/url";

  function gotoPrev() {
    if (search.results.hasPrev) {
      let page = search.results.prevPage + 1;
      if (page == 1) page = null; // no need to specify param for first page
      pushUrl(queryBuilder(null, { page }));
    }
  }

  function gotoNext() {
    if (search.results.hasNext) {
      pushUrl(queryBuilder(null, { page: search.results.nextPage + 1 }));
    }
  }
</script>

{#if $search.hasResults}
  {#if $search.results.count > 0}
    {#if $search.results.onlyPage}
      {$search.results.count} Documents
    {:else}
      <div>
        {$search.results.start + 1} - {$search.results.end} of {$search.results.count}
        Documents
      </div>
      <div>
        {#if $search.results.hasPrev}
          <button on:click={gotoPrev}>Prev</button>
        {/if}
        Page {$search.results.page + 1} of {$search.results.numPages}
        {#if $search.results.hasNext}
          <button on:click={gotoNext}>Next</button>
        {/if}
      </div>
    {/if}
  {/if}
{/if}
