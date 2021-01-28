<script>
  import { search, initSearch } from "@/search/search";
  import { pushUrl } from "@/router/router";
  import { queryBuilder } from "@/util/url";
  import { simplePlural } from "@/util/string";

  // SVG assets
  import leftPaginatorSvg from "@/assets/page_arrow_left.svg";
  import rightPaginatorSvg from "@/assets/page_arrow_right.svg";

  export let dialog = false;

  function gotoPrev() {
    if (search.results.hasPrev) {
      let page = search.results.prevPage + 1;
      if (page == 1) page = null; // no need to specify param for first page
      if (dialog) {
        initSearch({ ...search.params.params, page });
      } else {
        pushUrl(queryBuilder(null, { page }));
      }
    }
  }

  function gotoNext() {
    if (search.results.hasNext) {
      if (dialog) {
        initSearch({
          ...search.params.params,
          page: search.results.nextPage + 1,
        });
      } else {
        pushUrl(queryBuilder(null, { page: search.results.nextPage + 1 }));
      }
    }
  }
</script>

<style lang="scss">
  .paginator {
    display: table-cell;
    width: 100%;
    text-align: right;
    white-space: nowrap;

    > * {
      display: inline-block;
      vertical-align: middle;
    }

    .text {
      text-align: center;
      margin: 0 13px;

      .number {
        font-size: 14px;
      }

      .range {
        font-weight: bold;
      }

      .documents {
        color: rgba(0, 0, 0, 0.53);
        font-weight: bold;
        font-size: 11px;
        text-transform: uppercase;
      }
    }

    button {
      cursor: pointer;
      background: none;
      border: none;
      outline: none;
      width: 24px;
      height: 21px;
      padding: 2px 0;
      position: relative;
      text-align: center;

      :global(svg) {
        height: 8px;
      }

      &:hover {
        opacity: 0.8;

        &:disabled {
          opacity: 0.2;
        }
      }

      &:disabled,
      &:disabled:before {
        opacity: 0.2;
        cursor: default;
      }
    }
  }
</style>

<div class="paginator">
  {#if $search.hasResults}
    {#if $search.results.count > 0}
      <button disabled={!$search.results.hasPrev} on:click={gotoPrev}>
        {@html leftPaginatorSvg}
      </button>
      <div class="text">
        <div class="number">
          {#if $search.results.onlyPage}
            {$search.results.rawResults.results.length}
          {:else}
            <span class="range">
              {$search.results.start + 1}
              -
              {$search.results.end}
            </span>
            of
            {$search.results.count}
          {/if}
        </div>
        <div class="documents">
          {simplePlural($search.results.count, "Document")}
        </div>
      </div>
      <button disabled={!$search.results.hasNext} on:click={gotoNext}>
        {@html rightPaginatorSvg}
      </button>
    {/if}
  {/if}
</div>
