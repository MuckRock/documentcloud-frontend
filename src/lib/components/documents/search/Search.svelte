<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  import { _ } from "svelte-i18n";
  import { Search16, XCircleFill24 } from "svelte-octicons";

  import Badge from "../../common/Badge.svelte";
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
  let input: HTMLInputElement;
  let searchContainer: HTMLDivElement;
  let isFocused = false;

  const fields: SortField[] = ["score", "created_at", "page_count", "title"];

  // Calculate active filter count
  $: activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "access") return value !== "";
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null;
  }).length;

  // Check if sort is non-default
  $: hasCustomSort = sort !== "score" || direction !== "forward";

  function handleFocus() {
    isFocused = true;
  }

  function handleBlur(e: FocusEvent) {
    // Check if the new focus target is within the search container
    const relatedTarget = e.relatedTarget as Node;
    if (relatedTarget && searchContainer?.contains(relatedTarget)) {
      return; // Don't close if focus moved to another element in the container
    }
    // Use setTimeout to allow clicks on dropdown items to register
    setTimeout(() => {
      isFocused = false;
    }, 200);
  }

  function reset() {
    query = "";
    input.focus();
  }

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
  <div class="search-wrapper" bind:this={searchContainer}>
    <label for="search-input" class="search-field">
      <Search16 />
      <span class="sr-only">{$_("common.search")}</span>

      <!-- Status badges for active filters and sort -->
      {#if activeFilterCount > 0}
        <Badge
          label={activeFilterCount.toString()}
          badgeColor="var(--blue-1)"
          labelColor="var(--blue-4)"
          small
        />
      {/if}
      {#if hasCustomSort}
        <Badge
          label={$_(`documentBrowser.sort.fields.${sort}.label`)}
          badgeColor="var(--gray-1)"
          labelColor="var(--gray-5)"
          small
        />
      {/if}

      <input
        id="search-input"
        name="q"
        placeholder={$_("common.search")}
        type="search"
        autocomplete="off"
        spellcheck="false"
        bind:value={query}
        bind:this={input}
        on:focus={handleFocus}
        on:blur={handleBlur}
      />

      <button
        title={$_("search.reset")}
        type="reset"
        class:hidden={!query}
        on:click={reset}
      >
        <XCircleFill24 />
      </button>
    </label>

    <!-- Dropdown that appears when focused -->
    {#if isFocused}
      <div class="dropdown-panel" on:focusout={handleBlur}>
        <div class="dropdown-section">
          <h3>{$_("documentBrowser.filter.label")}</h3>
          <Filter bind:filters inline />
        </div>
        <div class="dropdown-section">
          <h3>{$_("documentBrowser.sort.label")}</h3>
          <Sort bind:direction bind:sort {fields} inline />
        </div>
      </div>
    {/if}
  </div>
</form>

<style>
  .search {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 0.25rem 0;
    width: 100%;
  }

  .search-wrapper {
    position: relative;
    flex: 1;
    width: 100%;
  }

  .search-field {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0.5rem;

    border: 1px solid var(--gray-2);
    border-radius: 0.5rem;
    padding: 0.5rem;

    background: var(--white);
    cursor: text;
  }

  .search-field:focus-within {
    outline: inherit;
    border-color: var(--blue-3);
    box-shadow: 0 0 0 1px var(--blue-3);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  input {
    flex: 1 1 auto;
    appearance: none;
    padding: 0.25rem;
    border: none;
    background: transparent;
    font-family: var(--font-sans, "Source Sans Pro");
    font-weight: var(--font-regular, 400);
    font-size: var(--font-md, 1rem);
    box-shadow: none;
  }

  input:focus {
    outline: none;
  }

  input::placeholder {
    color: var(--gray-4, #5c717c);
  }

  input[type="search"]::-webkit-search-cancel-button,
  input[type="search"]::-webkit-search-decoration {
    -webkit-appearance: none;
    appearance: none;
  }

  button {
    flex: 0 0 auto;
    appearance: none;
    border: none;
    display: flex;
    align-items: center;
    padding: 0;
    font-family: var(--font-sans, "Source Sans Pro");
    font-weight: var(--font-regular, 400);
    font-size: var(--font-md, 1rem);
    background: transparent;
    fill: var(--gray-3, #99a8b3);
    cursor: pointer;
    opacity: 1;
    visibility: visible;
    transform: translateX(0) rotate(0deg);
    transition:
      transform 0.25s ease-in-out,
      opacity 0.125s linear,
      visibility 0s;
  }

  button.hidden {
    visibility: hidden;
    opacity: 0;
    transform: translateX(100%) rotate(90deg);
    transition:
      transform 0.25s ease-in-out,
      opacity 0.125s linear,
      visibility 0s linear 0.25s,
      position 0s linear 0.25s;
  }

  .dropdown-panel {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    z-index: var(--z-dropdown, 1000);

    background: var(--white);
    border: 1px solid var(--gray-2);
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .dropdown-section h3 {
    margin: 0 0 0.5rem 0;
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
    color: var(--gray-5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .dropdown-section {
    display: flex;
    flex-direction: column;
  }
</style>
