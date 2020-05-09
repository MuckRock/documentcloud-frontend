<script>
  import SearchInput from "./SearchInput";
  import Button from "@/common/Button";
  import { onMount } from "svelte";

  import { handleSearch } from "@/search/search";
  import { showSearchTips } from "@/manager/layout";
  import { router } from "@/router/router";

  export let search = "";
  export let example = false;
  export let compact = false;
  let transformedQuery;

  function submitSearch() {
    handleSearch(search, transformedQuery);
  }

  onMount(() => {
    if (!example) {
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
    }
  });
</script>

<style lang="scss">
  .searchcontainer {
    margin: 0 0 20px 0;

    &.example {
      margin: 0;
    }

    .info {
      color: $gray;
      font-size: 12px;
      margin-left: 5px;
      margin-top: -3px;

      > span {
        vertical-align: middle;
        margin-right: 2px;
      }
    }

    code {
      color: #8a8a8a;
      border: solid 1px gainsboro;
      padding: 0 2px;
      border-radius: $radius;
    }
  }
</style>

<div class="searchcontainer" class:example>
  <SearchInput
    bind:value={search}
    bind:transformedQuery
    {example}
    {compact}
    on:search={submitSearch} />
  {#if !example}
    <div class="info">
      <span>
        Search tips: you can add filters by typing
        <code>user:</code>
        ,
        <code>project:</code>
        , or
        <code>organization:</code>
        , etc.
      </span>
      <Button action={true} small={true} on:click={showSearchTips}>
        Learn more
      </Button>
    </div>
  {/if}
</div>
