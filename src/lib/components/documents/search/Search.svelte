<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  import { _ } from "svelte-i18n";

  import Search from "../../inputs/Search.svelte";
  import Filter, { type FilterFields, defaultFilters } from "../Filter.svelte";
  import Sort, { type SortField, type SortDirection } from "../Sort.svelte";
  import { deserialize } from "./deserialize";
  import { serialize } from "./serialize";

  export let query = "";
  export let filters: FilterFields = defaultFilters;
  export let sort: SortField = "score";
  export let direction: SortDirection = "forward";
  export let otherParams: Record<string, string> = {};

  let form: HTMLFormElement;

  const fields: SortField[] = ["score", "created_at", "page_count", "title"];

  async function updatePropsFromQuery(pageUrlQuery: string) {
    const deserializedProps = await deserialize(pageUrlQuery);
    sort = deserializedProps.sort ?? sort;
    direction = deserializedProps.direction ?? direction;
    filters = Object.assign({}, filters, deserializedProps.filters);
  }

  function submit(search: string) {
    const url = new URL($page.url);
    url.search = search;
    Object.entries(otherParams).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
    return goto(url);
  }

  function handleSearch(e: Event) {
    e.preventDefault();
    const search = serialize({ query, filters, sort, direction });
    submit(search);
  }

  // When the page URL updates, we should update the query, filters, and sorting
  $: {
    updatePropsFromQuery($page.url.searchParams?.get("q") ?? "");
  }

  // We should call the submit function when the search parameters change
  /*   $: {
    const search = serialize({ query, filters, sort, direction });
    if (browser) {
      submit(search);
    }
  }
 */
  // DEBUG LOGGING STRINGS: REMOVE BEFORE MERGE
  // $: {
  //   console.log({
  //     query,
  //     filters,
  //     sort,
  //     direction,
  //     // searchString: formatSearchString(query),
  //   });
  // }
  // $: {
  //   console.log(formatSearchString(query));
  // }
</script>

<form class="search" bind:this={form} on:submit={handleSearch}>
  <div class="controls">
    <Filter bind:filters />
    <Sort bind:direction bind:sort {fields} />
  </div>
  <div class="text">
    <Search name="q" bind:value={query} />
  </div>
</form>

<style>
  .search {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
  }

  .text {
    flex: 1;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
