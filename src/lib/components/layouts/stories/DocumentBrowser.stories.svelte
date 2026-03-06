<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import ContextDecorator from "$lib/components/storybook/ContextDecorator.svelte";
  import DocumentBrowser from "../DocumentBrowser.svelte";

  import { documentsList } from "@/test/fixtures/documents";

  const { Story } = defineMeta({
    title: "Layout / Document Browser",
    component: DocumentBrowser,
    parameters: {
      layout: "fullscreen",
    },
  });
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";

  setContext("embed", false);

  const search = new SearchResultsState();
  search.setResults(Promise.resolve({ data: documentsList }));
  setSearchResults(search);

  const emptySearch = new SearchResultsState();
</script>

<Story name="With Data" />

<Story name="No documents" args={{ search: emptySearch }} />

<Story name="Embedded" asChild>
  <ContextDecorator embed={true}>
    <DocumentBrowser />
  </ContextDecorator>
</Story>
