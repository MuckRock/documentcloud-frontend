<script module lang="ts">
  import type { DocumentResults } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  import ResultsList from "../ResultsList.svelte";
  import Pending from "../Pending.svelte";
  import Unverified from "../../accounts/Unverified.svelte";
  import { SearchResultsState } from "$lib/state/search.svelte";

  import { me } from "@/test/fixtures/accounts";
  import { documents as mock } from "@/test/handlers/documents";

  // typescript complains without the type assertion
  import searchResults from "@/test/fixtures/documents/search-highlight.json";
  const highlighted = searchResults as unknown as DocumentResults;

  highlighted.results = highlighted.results.map((d) => ({
    ...d,
    highlights: undefined,
    note_highlights: undefined,
  }));

  import pending from "@/test/fixtures/documents/pending.json";

  const { Story } = defineMeta({
    title: "Documents / Results list",
    component: ResultsList,
  });

  const user = { ...me, verified_journalist: false };

  const empty = new SearchResultsState();
  const search = new SearchResultsState();

  search.setResults(Promise.resolve({ data: highlighted }));
</script>

<script lang="ts">
  import { writable } from "svelte/store";
  import {
    defaultVisibleFields,
    setVisibleFieldsContext,
  } from "../VisibleFields.svelte";

  setVisibleFieldsContext(writable(defaultVisibleFields));
</script>

<Story name="With Results" args={{ search }} />

<Story name="Empty" args={{ search: empty }} />

<Story
  name="Loading"
  args={{ search: new SearchResultsState({ loading: true }) }}
/>

<Story name="Infinite" asChild>
  <ResultsList {search} auto />
</Story>

<Story name="Pending documents" asChild>
  <ResultsList {search}>
    {#snippet start()}
      <Pending {pending} />
    {/snippet}
  </ResultsList>
</Story>

<Story name="Unverified user" asChild>
  <ResultsList {search}>
    {#snippet start()}
      <Unverified {user} />
    {/snippet}
  </ResultsList>
</Story>

<Story
  name="Loading error"
  parameters={{ msw: { handlers: [mock.error] } }}
  asChild
>
  <ResultsList {search} auto />
</Story>
