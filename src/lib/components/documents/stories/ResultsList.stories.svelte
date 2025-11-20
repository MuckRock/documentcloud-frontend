<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
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

  export const meta = {
    title: "Documents / Results list",
    component: ResultsList,
  };

  const user = { ...me, verified_journalist: false };
</script>

<Story name="With Results">
  <ResultsList {results} {count} {next} />
</Story>

<Story name="Empty">
  <ResultsList />
</Story>

<Story name="Infinite">
  <ResultsList {results} {count} {next} auto />
</Story>

<Story name="Pending documents">
  <ResultsList {results} {count} {next}>
    <Pending {pending} slot="start" />
  </ResultsList>
</Story>

<!-- too big to render
  <Story name="Highlighted">
    <ResultsList results={highlighted} {count} {next} />
  </Story>
-->

<Story name="Unverified user">
  <ResultsList {results} {count} {next}>
    <Unverified {user} slot="start" />
  </ResultsList>
</Story>

<Story name="Loading error" parameters={{ msw: { handlers: [mock.error] } }}>
  <ResultsList {results} {count} {next} auto />
</Story>
