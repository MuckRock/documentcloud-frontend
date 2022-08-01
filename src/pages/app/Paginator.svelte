<script>
  import { search, initSearch, searchNext, searchPrev } from "@/search/search";
  import { pushUrl } from "@/router/router";
  import { queryBuilder } from "@/util/url";
  import { simplePlural } from "@/util/string";
  import { _ } from "svelte-i18n";

  // SVG assets
  import leftPaginatorSvg from "@/assets/page_arrow_left.svg";
  import rightPaginatorSvg from "@/assets/page_arrow_right.svg";

  export let dialog = false;

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
    <button disabled={!$search.hasPrev} on:click={searchPrev}>
      {@html leftPaginatorSvg}
    </button>
    <div class="text">
      <div class="number">
        {#if $search.results.onlyPage}
          {$search.results.rawResults.results.length}
        {:else}
          <span class="range">
            {$search.start}
            -
            {$search.end}
          </span>
          {#if $search.results.count}
            {$_("paginator.of")}
            {$search.results.count}
          {/if}
        {/if}
      </div>
      <div class="documents">
        {$_("paginator.document", { values: { n: $search.results.count } })}
      </div>
    </div>
    <button disabled={!$search.hasNext} on:click={searchNext}>
      {@html rightPaginatorSvg}
    </button>
  {/if}
</div>
