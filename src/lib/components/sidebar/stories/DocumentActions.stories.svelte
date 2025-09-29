<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { writable, type Writable } from "svelte/store";
  import { Story } from "@storybook/addon-svelte-csf";
  import DocumentActions from "../DocumentActions.svelte";

  import docs from "@/test/fixtures/documents/documents.json";
  const documents = docs.results as Document[];

  const selected: Writable<Document[]> = writable(documents);

  export const meta = {
    title: "Components / Sidebar / Document Actions",
    component: DocumentActions,
    parameters: { layout: "centered" },
  };
</script>

<script lang="ts">
  import { setContext } from "svelte";

  setContext("selected", selected);
</script>

<Story name="default">
  <DocumentActions />
</Story>
