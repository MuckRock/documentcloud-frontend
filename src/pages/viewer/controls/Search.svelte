<script>
  import { layout, initiateSearch } from "@/viewer/layout";

  // SVG assets
  import viewerSearchIconSvg from "@/assets/viewer_search_icon.svg";
  import searchIconSvg from "@/assets/search_icon.svg";
  import closeInlineSvg from "@/assets/close_inline.svg";

  let query = "";
  let expand = false;

  $: invalidQuery = query.trim().length == 0;

  function retract() {
    query = "";
    expand = false;
  }

  function search() {
    if (invalidQuery) return;

    initiateSearch(query);
  }
</script>

<style lang="scss">
  .icon {
    @include buttonLike;

    margin: 0 12px;

    &.hide {
      display: none;
    }
  }

  .input {
    width: 0;
    max-width: 400px;
    box-sizing: border-box;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    transition: width 0.5s ease;

    input {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding-left: 40px;
      padding-right: 40px;
    }

    .searchicon {
      @include buttonLike;
      position: absolute;
      left: 14px;
      top: 50%;
      margin-top: -10.5px;

      &.disabled {
        pointer-events: none;
      }
    }

    .closeicon {
      @include buttonLike;
      position: absolute;
      right: 14px;
      top: 50%;
      margin-top: -7.5px;
    }

    > * {
      display: none;
    }

    &.expand {
      width: 100%;

      > * {
        display: inherit;
      }
    }
  }
</style>

<div class="input" class:expand>
  <input
    placeholder="Search"
    bind:value={query}
    disabled={$layout.searchPending}
    on:keypress={e => {
      if (e.key == 'Enter') {
        search();
      }
    }} />
  <div
    class="searchicon"
    class:disabled={invalidQuery || $layout.searchPending}
    on:click={search}>
    {@html searchIconSvg}
  </div>
  <div class="closeicon" on:click={retract}>
    {@html closeInlineSvg}
  </div>
</div>
<div class="icon" class:hide={expand} on:click={() => (expand = true)}>
  {@html viewerSearchIconSvg}
</div>
