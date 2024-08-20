<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import Revisions from "../Revisions.svelte";

  export const meta = {
    title: "Components / Documents / Revisions",
    component: Revisions,
    parameters: { layout: "padded" },
  };

  import revisions from "@/test/fixtures/documents/revisions.json";
  import doc from "@/test/fixtures/documents/document-expanded.json";

  const empty = doc as Document;
  const document = { ...doc, revisions } as Document;
</script>

<Story name="With Revisions">
  <Revisions {document} />
</Story>

<Story name="Empty">
  <Revisions document={empty} />
</Story>
