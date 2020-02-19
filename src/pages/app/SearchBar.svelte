<script>
  import SearchInput from "./SearchInput";
  import { onMount } from "svelte";

  import { handleSearch } from "@/search/search";
  import { router } from "@/router/router";

  // SVG assets
  import searchIconSvg from "@/assets/search_icon.svg";

  let search = "";

  function submitSearch() {
    handleSearch(search);
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
    max-width: 700px;

    @media only screen and (max-width: 600px) {
      margin: 0 0 44px 0;
    }

    :global(svg) {
      position: absolute;
      pointer-events: none;
      padding: 13px 17px;
    }
  }
</style>

<div class="search">
  {@html searchIconSvg}
  <SearchInput bind:value={search} on:search={submitSearch} />
</div>
