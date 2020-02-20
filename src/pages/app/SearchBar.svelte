<script>
  import SearchInput from "./SearchInput";
  import { onMount } from "svelte";

  import { handleSearch } from "@/search/search";
  import { router } from "@/router/router";

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
  .searchcontainer {
    margin: 0 0 74px 0;
  }
</style>

<div class="searchcontainer">
  <SearchInput bind:value={search} on:search={submitSearch} />
</div>
