<script module lang="ts">
  import type { Document } from "$lib/api/types";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Revisions from "../Revisions.svelte";

  import revisions from "@/test/fixtures/documents/revisions.json";
  import doc from "@/test/fixtures/documents/document-expanded.json";

  const { Story } = defineMeta({
    title: "Documents / Revisions",
    component: Revisions,
    parameters: { layout: "padded" },
  });

  const empty = doc as Document;
  const document = { ...doc, revisions } as Document;
</script>

<Story name="With Revisions" asChild>
  <Revisions {document} />
</Story>

<Story name="Empty" asChild>
  <Revisions document={empty} />
</Story>
