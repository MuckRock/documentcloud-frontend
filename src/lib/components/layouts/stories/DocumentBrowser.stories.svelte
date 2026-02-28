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

  const args = {
    documents: Promise.resolve({ data: documentsList }),
  };

  const empty = {
    documents: Promise.resolve({
      data: {
        results: [],
        next: null,
        previous: null,
        count: 0,
      },
    }),
  };
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";

  setContext("embed", false);
  setSearchResults(new SearchResultsState());
</script>

<Story name="With Data" {args} />

<Story name="No documents" args={empty} />

<Story name="Embedded" asChild>
  <ContextDecorator embed={true}>
    <DocumentBrowser {...args} />
  </ContextDecorator>
</Story>
