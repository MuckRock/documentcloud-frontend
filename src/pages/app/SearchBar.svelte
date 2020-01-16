<script>
  import emitter from "@/emit";

  // SVG assets
  import searchIconSvg from "@/assets/search_icon.svg";

  const emit = emitter({
    search() {}
  });

  const SEARCH_DELAY = 500;
  let timeout = null;
  let search = "";

  $: {
    if (timeout != null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      emit.search(search);
    }, SEARCH_DELAY);
  }

  function searchNow() {
    if (timeout != null) {
      clearTimeout(timeout);
      timeout = null;
    }
    emit.search(search);
  }

  function handleSearch(e) {
    if (e.which == 13 || e.keyCode == 13) {
      // Search on enter
      searchNow();
    }
  }
</script>

<style lang="scss">
  .search {
    background: #f1f2f4;
    height: 42px;
    border-radius: $radius;
    margin: 0 0 74px 0;
    width: 100%;
    position: relative;
    box-sizing: border-box;

    @media only screen and (max-width: 600px) {
      margin: 0 0 44px 0;
    }

    :global(svg) {
      position: absolute;
      pointer-events: none;
      padding: 13px 17px;
    }
  }

  input {
    width: 100%;
    height: 100%;
    padding-left: 56px;
    padding-right: 12px;
    font-family: inherit;
    border: none;
    line-height: 42px;
    font-size: 16px;
    color: black;
    outline: none;
    background: none;
    box-sizing: border-box;
  }

  ::placeholder {
    color: rgba(0, 0, 0, 0.76);
  }
</style>

<div class="search">
  {@html searchIconSvg}
  <input v-model="search" placeholder="Search" on:keyup={handleSearch} />
</div>
