<script>
  import Link from "@/router/Link";
  import { viewer } from "@/viewer/viewer";
  import { layout } from "@/viewer/layout";
  import { scroll, changeMode } from "@/viewer/renderer";

  // SVG assets
  import backArrowSvg from "@/assets/back_arrow.svg";
</script>

<style lang="scss">
  header {
    display: table;
    background: $viewerPaneColor;
    width: 100%;
    z-index: $viewerHeaderZ;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    position: relative;

    .valign {
      vertical-align: middle;
      display: table-cell;
    }

    h1 {
      font-weight: bold;
      font-size: 16px;
      color: $viewerBlack;
      margin: 0;
    }

    h2 {
      font-weight: normal;
      color: $viewerGray;
      font-size: 14px;
      margin: 4px 0;
    }

    .logo {
      padding-left: 24px;
    }
  }
</style>

<header style="height: {$layout.headerHeight}px">
  <div class="valign logo">
    <Link to="app">
      {@html backArrowSvg}
    </Link>
  </div>
  <div class="valign title">
    {#if $viewer.loaded}
      <h1>{$viewer.document.title}</h1>
      <h2>
        Contributed by {$viewer.document.userOrgString} - {$viewer.document.createdAtString}
      </h2>
    {/if}
  </div>
  <div class="valign">
    <button on:click={() => changeMode('image')}>Image mode</button>
    <button on:click={() => changeMode('text')}>Text mode</button>
    <button
      on:click={async () => {
        changeMode('image');
        await scroll(2050);
        window.setTimeout(() => changeMode('text'), 0);
      }}>
      Jump n switch
    </button>
  </div>
</header>
