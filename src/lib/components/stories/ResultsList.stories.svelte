<script context="module" lang="ts">
  import type { DocumentResults } from "@/lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import ResultsList from "../documents/ResultsList.svelte";

  // typescript complains without the type assertion
  import searchResults from "../../api/fixtures/documents/search-highlight.json";
  const results = searchResults as DocumentResults;

  export const meta = {
    title: "Components / Documents / Results list",
    component: ResultsList,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  const empty = {
    results: [],
    count: 0,
    next: null,
    previous: null,
    escaped: false,
  };
</script>

<Story name="yes results">
  <ResultsList {results} />
</Story>

<Story name="no results">
  <ResultsList results={empty} />
</Story>
