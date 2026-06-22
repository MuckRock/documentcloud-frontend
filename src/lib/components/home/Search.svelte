<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  import SearchEditor from "$lib/components/documents/search/SearchEditor.svelte";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";

  /* Create search context (editor has a silent dependency on this) */
  const search = new SearchResultsState({ loading: true });
  setSearchResults(search);

  /* Handle search submission */
  function handleSearchSubmit(detail: { q: string }) {
    const url = new URL("/documents/", page.url.origin);
    url.searchParams.set("q", detail.q);
    goto(url);
  }
</script>

<SearchEditor onsubmit={handleSearchSubmit} />
