<script>
  import { layout } from "@/viewer/layout.js";
  import { initiateSearch, exitSearch, doc } from "@/viewer/document.js";
  import { tick } from "svelte";
  import { _ } from "svelte-i18n";

  // SVG assets
  import viewerSearchIconSvg from "@/assets/viewer_search_icon.svg";
  import searchIconSvg from "@/assets/search_icon.svg";
  import closeInlineSvg from "@/assets/close_inline.svg";

  let query = "";
  let searchElem = null;

  $: invalidQuery = query.trim().length == 0;

  async function retract() {
    query = "";
    layout.searchExpanded = false;
    await exitSearch();
  }

  function expandSearch() {
    query = "";
    layout.searchExpanded = true;
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

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key == "f") {
      if (
        !layout.disableControls &&
        !layout.dialogShown &&
        (doc.mode == "image" || doc.mode == "search")
      ) {
        e.preventDefault();
        // Show search bar
        const prevQuery = query;
        expandSearch();
        query = prevQuery;
        try {
          searchElem.select();
        } catch (e) {}
      }
    } else if (e.key == "Escape") {
      if (layout.searchExpanded) retract();
    }
  }
</script>

<style>
  .icon {
    margin: 0 12px;
  }

  .icon.hide {
    display: none;
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
  }

  .container {
    position: absolute;
    left: 30px;
    top: 0;
    bottom: 0;
    right: 30px;
  }

  .container input {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    outline: none;
    border: none;
    box-shadow: none;
  }

  .searchicon {
    position: absolute;
    left: 14px;
    top: 50%;
    margin-top: -10.5px;
  }

  .searchicon.disabled {
    pointer-events: none;
  }

  .closeicon {
    position: absolute;
    right: 14px;
    top: 50%;
    margin-top: -7.5px;
  }

  .input > * {
    display: none;
  }

  .input.expand {
    width: 100%;
  }

  .input.expand > * {
    display: inherit;
  }
</style>

<div class="input" class:expand={$layout.searchExpanded}>
  <div class="container">
    <input
      type="search"
      bind:this={searchElem}
      bind:value={query}
      placeholder={$_("searchBar.search")}
      disabled={$layout.searchPending}
      on:keypress={(e) => {
        if (e.key == "Enter") {
          search();
        }
      }}
    />
  </div>
  <button
    class="searchicon buttonLike"
    class:disabled={invalidQuery || $layout.searchPending}
    on:click={search}
  >
    {@html searchIconSvg}
  </button>
  <button class="closeicon buttonLike" on:click={retract}>
    {@html closeInlineSvg}
  </button>
</div>
<button
  class="icon buttonLike"
  class:hide={$layout.searchExpanded}
  on:click={expandSearch}
>
  {@html viewerSearchIconSvg}
</button>

<svelte:window on:keydown={handleKeyDown} />
