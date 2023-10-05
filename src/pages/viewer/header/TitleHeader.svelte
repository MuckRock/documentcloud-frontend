<script>
  import { _ } from "svelte-i18n";

  // Controls
  import Loader from "@/common/Loader.svelte";
  import Search from "../controls/Search.svelte";
  import Hamburger from "../controls/Hamburger.svelte";

  import Link from "@/router/Link.svelte";
  import { viewer } from "@/viewer/viewer.js";
  import { layout } from "@/viewer/layout.js";

  // SVG assets
  import backArrowSvg from "@/assets/back_arrow.svg?raw";
</script>

<style>
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
    color: var(--viewerFg, rgba(0, 0, 0, 0.8));
    user-select: none;
  }
  .title > * {
    display: inline-block;
    margin: 0;
  }

  .title h1 {
    font-size: 18px;
    margin: 0 5px;
    word-break: break-all;
  }

  .title .padleft {
    margin-left: 30px;
  }

  .title h2 {
    color: var(--viewerSecondary, rgba(0, 0, 0, 0.78));
    font-size: 14px;
    font-weight: normal;
    margin: 0 5px;
  }
</style>

<!-- Expanding cell to hold title and optional back -->
<div class="cell">
  {#if !$layout.embed}
    <div class="back">
      <Link back={true} style="margin-top: {$layout.headerHeight - 20}px">
        {@html backArrowSvg}
      </Link>
    </div>
  {/if}
</div>
<div class="cell expand">
  {#if $viewer.loaded}
    <div class="title">
      {#if !$layout.embed && $viewer.document.readable}
        <Loader active={true} pad={true} />
      {/if}
      {#if $layout.title}
        <h1 class:padleft={$layout.embed}>{$viewer.document.title}</h1>
        <h2>
          {$_("titleHeader.contributedBy", {
            values: {
              name: $layout.showOrg
                ? $viewer.document.orgString
                : $viewer.document.userOrgString,
            },
          })}
        </h2>
      {/if}
    </div>
  {/if}
</div>
<div class="cell">
  <Search />
</div>
<div class="cell">
  <Hamburger />
</div>
