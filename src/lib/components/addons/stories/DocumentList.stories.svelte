<script module lang="ts">
  import type { DocumentResults } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  import DocumentList from "../DocumentList.svelte";
  import { SearchResultsState } from "$lib/state/search.svelte";

  import searchResults from "@/test/fixtures/documents/search-highlight.json";
  const results = {
    ...(searchResults as unknown as DocumentResults),
    results: (searchResults as unknown as DocumentResults).results.map((d) => ({
      ...d,
      highlights: undefined,
      note_highlights: undefined,
    })),
  };

  const { Story } = defineMeta({
    title: "Add-Ons / Document List",
    component: DocumentList,
    parameters: {
      layout: "fullscreen",
    },
  });

  const search = new SearchResultsState();
  search.setResults(async () => ({ data: results }));
</script>

<script lang="ts">
  import { writable } from "svelte/store";
  import {
    defaultVisibleFields,
    setVisibleFieldsContext,
  } from "$lib/components/documents/VisibleFields.svelte";
  import { setSearchResults } from "$lib/state/search.svelte";

  setVisibleFieldsContext(writable(defaultVisibleFields));
  setSearchResults(search);
</script>

<Story name="With Results" args={{ query: "boston" }} />
