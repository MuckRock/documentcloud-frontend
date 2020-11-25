<script>
  // Controls
  import Loader from "@/common/Loader";
  import Search from "../controls/Search";
  import Hamburger from "../controls/Hamburger";

  import Link from "@/router/Link";
  import { viewer } from "@/viewer/viewer";
  import { layout } from "@/viewer/layout";

  $: style = `height: ${$layout.headerHeight}px; line-height: ${$layout.headerHeight}px`;

  // SVG assets
  import backArrowSvg from "@/assets/back_arrow.svg";
</script>

<style lang="scss">
  .expand {
    width: 100%;
  }

  .cell {
    display: table-cell;
    vertical-align: middle;
  }

  .back {
    margin: 0 16px 0 16px;
  }

  .title {
    color: $viewerFg;
    user-select: none;

    > * {
      display: inline-block;
      margin: 0;
    }

    h1 {
      font-size: 18px;
      margin: 0 5px;
      word-break: break-all;

      &.padleft {
        margin-left: 30px;
      }
    }

    h2 {
      color: $viewerSecondary;
      font-size: 14px;
      font-weight: normal;
      margin: 0 5px;
    }
  }
</style>

<!-- Expanding cell to hold title and optional back -->
<div class="cell" {style}>
  {#if !$layout.embed}
    <div class="back">
      <Link back={true} style="margin-top: {$layout.headerHeight - 20}px">
        {@html backArrowSvg}
      </Link>
    </div>
  {/if}
</div>
<div class="cell expand" {style}>
  {#if $viewer.loaded}
    <div class="title" {style}>
      {#if !$layout.embed && $viewer.document.readable}
        <Loader active={true} pad={true} />
      {/if}
      <h1 class:padleft={$layout.embed}>{$viewer.document.title}</h1>
      <h2>Contributed by {$viewer.document.userOrgString}</h2>
    </div>
  {/if}
</div>
<div class="cell" {style}>
  <Search />
</div>
<div class="cell" {style}>
  <Hamburger />
</div>
