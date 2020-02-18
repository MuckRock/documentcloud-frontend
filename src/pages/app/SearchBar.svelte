<script>
  import { onMount } from "svelte";

  import { handleSearch } from "@/search/search";
  import { router } from "@/router/router";

  // SVG assets
  import searchIconSvg from "@/assets/search_icon.svg";

  let search = "";

  function handleKeyUp(e) {
    if (e.which == 13 || e.keyCode == 13) {
      // Search on enter
      handleSearch(search);
    }
  }

  onMount(() => {
    router.subscribe(router => {
      // Set query from URL if applicable
      const route = router.resolvedRoute;
      if (route != null && route.name == "app") {
        if (route.props.q != null) {
          let query = route.props.q.trim();
          if (query.length > 0) search = query;
        } else {
          search = "";
        }
      }
    });
  });
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
  <input bind:value={search} placeholder="Search" on:keyup={handleKeyUp} />
</div>
