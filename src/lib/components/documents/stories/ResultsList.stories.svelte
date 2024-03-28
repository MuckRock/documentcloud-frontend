<script context="module" lang="ts">
  import type { Document, DocumentResults } from "@/lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import ResultsList from "../ResultsList.svelte";

  // typescript complains without the type assertion
  import searchResults from "../../../api/fixtures/documents/search-highlight.json";
  const results = searchResults.results as Document[];
  const count = searchResults.count;
  const next = searchResults.next;

  export const meta = {
    title: "Components / Documents / Results list",
    component: ResultsList,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="With Results">
  <div style="width: 36rem"><ResultsList {results} {count} {next} /></div>
</Story>

<Story name="Empty">
  <div style="width: 36rem"><ResultsList /></div>
</Story>
