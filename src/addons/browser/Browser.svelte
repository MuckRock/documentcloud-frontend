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
  let next_url = "";
  let previous_url = "";

  $: loadParams = buildParams({
    per_page,
    query: $query,
    filters: $filters,
    categories: $categories,
  });

  $: if (visible) {
    load(loadParams);
  }

  $: console.log(loadParams);

  export async function load({
    query = "",
    filters = {},
    per_page = 5,
    url = "",
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

    const { next, previous, results } = await fetch(url)
      .then((r) => r.json())
      .catch((err) => {
        error = err;
        loading = false;
        return {};
      });

    next_url = next;
    previous_url = previous;
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
  }
  .header {
    flex: 1 1 100%;
  }
  .header h2 {
    margin: 0;
  }
  .sidebar {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
  }
  .results {
    flex: 1 1 24em;
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

<Drawer bind:this={drawer} bind:visible anchor="right">
  <div slot="content" class="browser">
    <header class="header">
      <h2>Add-Ons</h2>
    </header>
    <aside class="sidebar">
      <Search />
      <Filters />
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
