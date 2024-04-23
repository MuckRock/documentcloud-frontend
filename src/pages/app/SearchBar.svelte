<script>
  import { _ } from "svelte-i18n";
  import { onMount, onDestroy } from "svelte";

  import SearchInput from "./SearchInput.svelte";
  import Button from "@/common/Button.svelte";

  import {
    handleSearch,
    search as searchData,
    userSearchQuery,
  } from "@/search/search.js";
  import { showSearchTips } from "@/manager/layout.js";
  import { router } from "@/router/router.js";

  export let search = "";
  export let example = false;
  export let compact = false;
  export let embed = false;
  export let dialog = false;

  let transformedQuery;

  function submitSearch() {
    handleSearch(search, !dialog);
  }

  let unsubscribe = [];
  onMount(() => {
    if (!example) {
      if (dialog && searchData.filePickerUser != null) {
        // Fill in search box for user if mounting in a dialog
        search = userSearchQuery(searchData.filePickerUser);
      } else {
        unsubscribe = [
          router.subscribe((router) => {
            // Set query from URL if applicable
            const route = router.resolvedRoute;
            if (route != null && route.name == "app") {
              // Try to fill in regular query if not present
              if (route.props.q != null && route.props.q.length > 0) {
                search = route.props.q;
              } else {
                search = "";
              }
            }
          }),
        ];
      }
    }
  });

  onDestroy(() => {
    unsubscribe.forEach((x) => x());
  });
</script>

<div class="searchcontainer" class:example>
  <SearchInput
    bind:value={search}
    bind:transformedQuery
    {example}
    {compact}
    on:search={submitSearch}
  />
  {#if !embed && !example}
    <div class="info">
      <span>
        {@html $_("searchBar.tips")}
      </span>
      <Button
        action={true}
        small={true}
        nomargin={true}
        on:click={showSearchTips}
      >
        {$_("searchBar.learnMore")}
      </Button>
    </div>
  {/if}
</div>

<style>
  .searchcontainer {
    margin: 0 0 20px 0;
  }

  @media only screen and (max-width: 720px) {
    .searchcontainer {
      margin: 0 0 30px 0;
    }
  }

  .searchcontainer.example {
    margin: 0;
  }

  .searchcontainer .info {
    color: var(--gray);
    font-size: 12px;
    margin-left: 5px;
    margin-top: -3px;
  }

  .searchcontainer .info > span {
    vertical-align: middle;
    margin-right: 2px;
  }

  .searchcontainer :global(code) {
    color: #8a8a8a;
    border: solid 1px gainsboro;
    padding: 0 2px;
    border-radius: var(--radius);
  }
</style>
