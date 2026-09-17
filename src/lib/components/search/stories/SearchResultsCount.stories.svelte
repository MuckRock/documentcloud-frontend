<script module lang="ts">
  import type { DocumentResults } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  import SearchResultsCount from "../SearchResultsCount.svelte";
  import { SearchResultsState } from "$lib/state/search.svelte";

  import searchResults from "@/test/fixtures/documents/search-highlight.json";
  const results = searchResults as unknown as DocumentResults;

  const withTotal = new SearchResultsState();
  withTotal.setResults(Promise.resolve({ data: results }));

  const withoutTotal = new SearchResultsState();
  withoutTotal.setResults(
    Promise.resolve({ data: { ...results, count: undefined } }),
  );

  const { Story } = defineMeta({
    title: "Search / Results Count",
    parameters: { layout: "centered" },
    component: SearchResultsCount,
  });
</script>

<Story name="With Total" args={{ search: withTotal }} />

<Story name="Without Total" args={{ search: withoutTotal }} />
