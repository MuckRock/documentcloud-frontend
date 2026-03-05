<script module lang="ts">
  import type { DocumentResults } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ResultsList from "../ResultsList.svelte";
  import Demo from "../tests/ResultsList.demo.svelte";
  import Pending from "../Pending.svelte";
  import Unverified from "../../accounts/Unverified.svelte";

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
</script>

<Story name="With Results" asChild>
  <Demo results={highlighted.results}>
    <ResultsList />
  </Demo>
</Story>

<Story name="Empty" asChild>
  <Demo>
    <ResultsList />
  </Demo>
</Story>

<Story name="Infinite" asChild>
  <Demo results={highlighted.results}>
    <ResultsList auto />
  </Demo>
</Story>

<Story name="Pending documents" asChild>
  <Demo results={highlighted.results}>
    <ResultsList>
      {#snippet start()}
        <Pending {pending} />
      {/snippet}
    </ResultsList>
  </Demo>
</Story>

<Story name="Unverified user" asChild>
  <Demo results={highlighted.results}>
    <ResultsList>
      {#snippet start()}
        <Unverified {user} />
      {/snippet}
    </ResultsList>
  </Demo>
</Story>

<Story
  name="Loading error"
  parameters={{ msw: { handlers: [mock.error] } }}
  asChild
>
  <Demo results={highlighted.results}>
    <ResultsList auto />
  </Demo>
</Story>
