<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import DocumentActions from "../DocumentActions.svelte";

  import docs from "@/test/fixtures/documents/documents.json";
  const documents = docs.results as Document[];

  export const meta = {
    title: "Navigation / Document Actions",
    component: DocumentActions,
    parameters: { layout: "centered" },
  };
</script>

<script lang="ts">
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";

  const search = new SearchResultsState();
  search.visible = new Map(documents.map((d) => [String(d.id), d]));
  search.selectedIds = documents.map((d) => String(d.id));
  setSearchResults(search);
</script>

<Story name="default">
  <DocumentActions />
</Story>
