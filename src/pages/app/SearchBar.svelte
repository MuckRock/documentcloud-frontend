<script>
  import SearchInput from "./SearchInput";
  import { onMount } from "svelte";

  import { handleSearch } from "@/search/search";
  import { router } from "@/router/router";

  let search = "";
  let transformedQuery;

  function submitSearch() {
    handleSearch(search, transformedQuery);
  }

  onMount(() => {
    router.subscribe(router => {
      // Set query from URL if applicable
      const route = router.resolvedRoute;
      if (route != null && route.name == "app") {
        // Try to fill in display query first, then regular query if not present
        if (route.props.dq != null && route.props.dq.length > 0) {
          search = route.props.dq;
        } else if (route.props.q != null && route.props.q.length > 0) {
          search = route.props.q;
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
  <SearchInput
    bind:value={search}
    bind:transformedQuery
    on:search={submitSearch} />
</div>
