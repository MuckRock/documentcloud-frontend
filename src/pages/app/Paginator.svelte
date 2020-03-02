<script>
  import { search } from "@/search/search";
  import { pushUrl } from "@/router/router";
  import { queryBuilder } from "@/util/url";
  import { simplePlural } from "@/util/string";

  // SVG assets
  import leftPaginatorSvg from "@/assets/left_paginator.svg";
  import rightPaginatorSvg from "@/assets/right_paginator.svg";

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
      $depress: 2px;
      $top: -1px;
      $bottom: -4px;
      outline: none;

      cursor: pointer;
      background: #eaeaea !important;
      border: solid 1px #989898;
      border-radius: $radius;
      width: 24px;
      height: 21px;
      padding: 2px 0;
      position: relative;

      &:before {
        content: "";
        background: #c5c5c5;
        border: solid 1px #a7a7a7;
        border-radius: $radius;
        position: absolute;
        top: $top;
        left: -1px;
        right: -2.5px;
        bottom: $bottom;
        z-index: -1;
      }

      &:hover {
        margin-top: $depress;

        &:before {
          bottom: $bottom + ($depress / 2);
        }

        &:disabled {
          margin-top: 0;

          &:before {
            bottom: $bottom;
          }
        }
      }

      &:disabled,
      &:disabled:before {
        opacity: 0.2;
        cursor: default;
      }

      :global(svg) {
        height: 14px;
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
            {$search.results.count}
          {:else}
            <span class="range">
              {$search.results.start + 1} - {$search.results.end}
            </span>
            of {$search.results.count}
          {/if}
        </div>
        <div class="documents">
          {simplePlural($search.results.count, 'Document')}
        </div>
      </div>
      <button disabled={!$search.results.hasNext} on:click={gotoNext}>
        {@html rightPaginatorSvg}
      </button>
    {/if}
  {/if}
</div>
