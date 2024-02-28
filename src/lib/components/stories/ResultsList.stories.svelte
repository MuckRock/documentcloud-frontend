<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import ResultsList from "../documents/ResultsList.svelte";

  import searchResults from "$lib/api/fixtures/documents/search.json";

  export const meta = {
    title: "Components / Documents / Results list",
    component: ResultsList,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="results">
  <ResultsList results={searchResults} />
</Story>

<Story name="empty">
  <ResultsList />
</Story>
