<script context="module" lang="ts">
  import type { Document } from "@/lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import ResultsList from "../ResultsList.svelte";
  import Pending from "../Pending.svelte";

  // typescript complains without the type assertion
  import searchResults from "../../../api/fixtures/documents/search-highlight.json";
  const results = searchResults.results as Document[];
  const count = searchResults.count;
  const next = searchResults.next;

  import pending from "$lib/api/fixtures/documents/pending.json";

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

<Story name="Infinite">
  <div style="width: 36rem"><ResultsList {results} {count} {next} auto /></div>
</Story>

<Story name="Pending documents">
  <div style="width: 36rem">
    <ResultsList {results} {count} {next}>
      <Pending {pending} />
    </ResultsList>
  </div>
</Story>
