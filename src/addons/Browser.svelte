<script lang="ts">
  import { onMount } from "svelte";

  import { baseApiUrl } from "../api/base.js";
  import AddOnList from "./AddOnList.svelte";
  import CategoryFilter from "./CategoryFilter.svelte";
  import Modal from "./Modal.svelte";
  import Paginator from "./Paginator.svelte";
  import SearchInput from "./SearchInput.svelte";
  import TopFilters from "./TopFilters.svelte";

  export let visible = false;

  let modal: Modal;
  let items = [];
  let loading = false;
  let error = null;
  let next_url = "";
  let previous_url = "";

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

  onMount(async () => {
    await load();
  });
</script>

<style>
  [slot="content"] {
    display: flex;
    gap: 1em;
    padding: 1em;
  }
</style>

<Modal bind:this={modal} bind:visible anchor="right">
  <div slot="header">
    <h2>Add-Ons</h2>
  </div>

  <div slot="content">
    <div class="rail">
      <SearchInput />
      <TopFilters />
      <CategoryFilter />
    </div>
    <div class="list">
      <AddOnList {loading} {error} {items} />
      <Paginator
        has_next={Boolean(next_url)}
        has_previous={Boolean(previous_url)}
        on:next={loadNext}
        on:previous={loadPrevious}
      />
    </div>
  </div>
</Modal>
