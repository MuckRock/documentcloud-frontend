<script module lang="ts">
  import type { Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ResultsList from "../ResultsList.svelte";
  import Pending from "../Pending.svelte";
  import Unverified from "../../accounts/Unverified.svelte";

  import { me } from "@/test/fixtures/accounts";
  import { documents as mock } from "@/test/handlers/documents";

  // typescript complains without the type assertion
  import searchResults from "@/test/fixtures/documents/search-highlight.json";
  const highlighted = searchResults.results as unknown as Document[];
  const results = highlighted.map((d) => ({
    ...d,
    highlights: null,
    note_highlights: null,
  })) as unknown as Document[];
  const count = searchResults.count;
  const next = searchResults.next;

  import pending from "@/test/fixtures/documents/pending.json";

  const { Story } = defineMeta({
    title: "Documents / Results list",
    component: ResultsList,
  });

  const user = { ...me, verified_journalist: false };
</script>

<script lang="ts">
  import { writable } from "svelte/store";
  import { setContext } from "svelte";
  import {
    defaultVisibleFields,
    setVisibleFieldsContext,
  } from "../VisibleFields.svelte";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";

  // Set up contexts needed by ResultsList
  setContext("embed", false);
  setVisibleFieldsContext(writable(defaultVisibleFields));
  setSearchResults(new SearchResultsState());
</script>

<Story name="With Results" asChild>
  <ResultsList {results} {count} {next} />
</Story>

<Story name="Empty" />

<Story name="Infinite" asChild>
  <ResultsList {results} {count} {next} auto />
</Story>

<Story name="Pending documents" asChild>
  <ResultsList {results} {count} {next}>
    {#snippet start()}
      <Pending {pending} />
    {/snippet}
  </ResultsList>
</Story>

<Story name="Unverified user" asChild>
  <ResultsList {results} {count} {next}>
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
  <ResultsList {results} {count} {next} auto />
</Story>
