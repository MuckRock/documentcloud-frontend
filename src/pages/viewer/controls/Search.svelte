<script>
  import { layout, initiateSearch } from "@/viewer/layout";
  import { tick } from "svelte";

  // SVG assets
  import viewerSearchIconSvg from "@/assets/viewer_search_icon.svg";
  import searchIconSvg from "@/assets/search_icon.svg";
  import closeInlineSvg from "@/assets/close_inline.svg";

  let query = "";
  let expand = false;
  let searchElem = null;

  $: invalidQuery = query.trim().length == 0;

  function retract() {
    query = "";
    expand = false;
  }

  function expandSearch() {
    query = "";
    expand = true;
    tick().then(() => {
      if (searchElem != null) {
        searchElem.focus();
      }
    });
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
    background: white;

    .container {
      position: absolute;
      left: 30px;
      top: 0;
      bottom: 0;
      right: 30px;

      input {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        outline: none;
        border: none;
        box-shadow: none;
      }
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
  <div class="container">
    <input
      bind:this={searchElem}
      placeholder="Search"
      bind:value={query}
      disabled={$layout.searchPending}
      on:keypress={e => {
        if (e.key == 'Enter') {
          search();
        }
      }} />
  </div>
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
<div class="icon" class:hide={expand} on:click={expandSearch}>
  {@html viewerSearchIconSvg}
</div>
