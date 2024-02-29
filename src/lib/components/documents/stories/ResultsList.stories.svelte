<script context="module" lang="ts">
  import type { DocumentResults } from "@/lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import ResultsList from "../ResultsList.svelte";

  // typescript complains without the type assertion
  import searchResults from "../../../api/fixtures/documents/search-highlight.json";
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

<Story name="With Results">
  <div style="width: 36rem"><ResultsList {results} /></div>
</Story>

<Story name="Empty">
  <div style="width: 36rem"><ResultsList results={empty} /></div>
</Story>
