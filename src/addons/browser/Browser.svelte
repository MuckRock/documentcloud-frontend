<svelte:options accessors={true} />

<script lang="ts">
  import { _ } from "svelte-i18n";
  import { baseApiUrl } from "../../api/base.js";
  import AddOnList from "./AddOnList.svelte";
  import type { AddOnListItem } from "./AddOnListItem.svelte";
  import Drawer from "../Drawer.svelte";
  import Paginator from "../Paginator.svelte";
  import Search, { query } from "./SearchInput.svelte";
  import Filters, { filters, categories } from "./Filters.svelte";

  export let visible = false;
  export let per_page = 5;

  let drawer: Drawer;
  let loading = false;
  let error = null;
  let res: {
    next?: string | null;
    previous?: string | null;
    results?: AddOnListItem[];
  } = {};

  const options: RequestInit = {
    credentials: "include",
  };

  $: urlParams = buildParams({
    per_page,
    query: $query,
    filters: $filters,
    categories: $categories,
  });

  $: url = buildUrl(urlParams);
  $: next_url = res.next ? new URL(res.next).toString() : null;
  $: previous_url = res.previous ? new URL(res.previous).toString() : null;
  $: items = res.results;

  export async function load(url) {
    loading = true;

    res = await fetch(url, options)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw data;
        return data;
      })
      .catch((err) => {
        error = err;
        loading = false;
        return {};
      });

    loading = false;
  }

  $: if (visible) {
    load(url);
  }
  $: loadNext = () => load(next_url);
  $: loadPrev = () => load(previous_url);
  $: reload = () => load(url);

  function buildUrl({ query = "", filters = {}, per_page = 5 }) {
    const u = new URL("addons/", baseApiUrl);

    u.search = new URLSearchParams({
      query,
      per_page: String(per_page),
      ...filters,
    }).toString();

    return u.toString();
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
    display: grid;
    grid-template-columns: 1fr 3fr;
    grid-template-rows: auto 1fr;
    gap: 1em;
    padding: 1em 1em 0;
    height: 100%;
    width: 100%;
    max-width: 44em;
    box-sizing: border-box;
  }
  .header {
    grid-column: span 2;
    display: flex;
    flex-direction: column;
    align-items: baseline;
    gap: 0.5em;
    margin-right: 2em;
  }
  .header h2 {
    flex: 0 1 auto;
    margin: 0;
  }
  .header p {
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
    min-height: 0;
    max-height: 100%;
    display: flex;
    flex-direction: column;
  }
  .results .list {
    flex: 1 1 24em;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    border: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: calc(2 * var(--radius));
    overflow-y: scroll;
  }
  .results .pagination {
    flex: 0 0 auto;
  }
</style>

<Drawer bind:this={drawer} bind:visible anchor="right" on:open on:close>
  <div slot="content" class="browser">
    <header class="header">
      <h2>{$_("addonBrowserDialog.title")}</h2>
      <p>{$_("addonBrowserDialog.subtitle")}</p>
    </header>
    <aside class="sidebar">
      <div class="search"><Search /></div>
      <div class="filters"><Filters /></div>
    </aside>
    <main class="results">
      <div class="list">
        <AddOnList {loading} {error} {items} bind:reload />
      </div>
      <div class="pagination">
        <Paginator
          has_next={Boolean(next_url)}
          has_previous={Boolean(previous_url)}
          on:next={loadNext}
          on:previous={loadPrev}
        />
      </div>
    </main>
  </div>
</Drawer>
