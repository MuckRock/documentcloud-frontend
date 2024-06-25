<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import Revisions from "../Revisions.svelte";

  export const meta = {
    title: "Components / Documents / Revisions",
    component: Revisions,
    parameters: { layout: "padded" },
  };

  import revisions from "$lib/api/fixtures/documents/revisions.json";
  import doc from "$lib/api/fixtures/documents/document-expanded.json";

  const empty = doc as Document;
  const document = { ...doc, revisions } as Document;
</script>

<Story name="default">
  <Revisions {document} />
</Story>

<Story name="no revisions">
  <Revisions document={empty} />
</Story>
