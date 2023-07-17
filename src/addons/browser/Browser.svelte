<svelte:options accessors={true} />

<script lang="ts">
  import { baseApiUrl } from "../../api/base.js";
  import AddOnList from "./AddOnList.svelte";
  import Drawer from "../Drawer.svelte";
  import Paginator from "../Paginator.svelte";
  import Search, { query } from "./SearchInput.svelte";
  import Filters, { filters, categories } from "./Filters.svelte";

  export let visible = false;
  export let per_page = 5;

  let drawer: Drawer;
  let items = [];
  let loading = false;
  let error = null;
  let next_url: URL | null;
  let previous_url: URL | null;

  const options: RequestInit = {
    credentials: "include",
  };

  $: loadParams = buildParams({
    per_page,
    query: $query,
    filters: $filters,
    categories: $categories,
  });

  $: if (visible) {
    load(loadParams);
  }

  export async function load({
    query = "",
    filters = {},
    per_page = 5,
    url = null,
  } = {}) {
    if (!url) {
      const u = new URL("addons/", baseApiUrl);

      u.search = new URLSearchParams({
        query,
        per_page: String(per_page),
        ...filters,
      }).toString();

      url = u.toString();
    }

    loading = true;

    const { next, previous, results } = await fetch(url, options)
      .then((r) => r.json())
      .catch((err) => {
        error = err;
        loading = false;
        return {};
      });

    next_url = next ? new URL(next) : null;
    previous_url = previous ? new URL(previous) : null;
    items = results;
    loading = false;
  }

  function loadNext(e) {
    return load({ url: next_url });
  }

  function loadPrevious(e) {
    return load({ url: previous_url });
  }

  function buildParams({
    query = "",
    filters = [],
    categories = [],
    per_page = 5,
  }) {
    const params = { per_page, query, filters: {} };

    params.filters = filters.reduce((m, f) => {
      m[f] = true;
      return m;
    }, {});

    if (categories.length) {
      params.filters["category"] = categories.join(",");
    }

    return params;
  }
</script>

<style>
  .browser {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    padding: 1em;
    max-width: 44em;
  }
  .header {
    flex: 1 1 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 1em;
  }
  .header h2 {
    flex: 0 1 auto;
    margin: 0;
  }
  .header p {
    flex: 1 1 16em;
    margin: 0;
    font-weight: 600;
    color: gray;
  }
  .sidebar {
    flex: 1 1 12em;
    display: flex;
    flex-direction: column;
  }
  .search {
    margin-bottom: 1em;
  }
  .results {
    flex: 4 1 24em;
    min-width: 20em;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
  .results .list {
    flex: 1 1 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    border: 1px solid;
    border-radius: 3px;
  }
  .results .pagination {
    flex: 0 0 auto;
  }
</style>

<Drawer bind:this={drawer} bind:visible anchor="right" on:open on:close>
  <div slot="content" class="browser">
    <header class="header">
      <h2>Add-Ons</h2>
      <p>
        Free automations, shortcuts, and power-ups from the DocumentCloud
        community
      </p>
    </header>
    <aside class="sidebar">
      <div class="search"><Search /></div>
      <div class="filters"><Filters /></div>
    </aside>
    <main class="results">
      <div class="list"><AddOnList {loading} {error} {items} /></div>
      <div class="pagination">
        <Paginator
          has_next={Boolean(next_url)}
          has_previous={Boolean(previous_url)}
          on:next={loadNext}
          on:previous={loadPrevious}
        />
      </div>
    </main>
  </div>
</Drawer>
