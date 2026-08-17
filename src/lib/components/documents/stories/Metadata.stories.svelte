<script module lang="ts">
  import type { Document, Org } from "$lib/api/types";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import MetadataComponent from "../Metadata.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  const document = doc as Document;

  const { Story } = defineMeta({
    title: "Documents / Metadata",
    component: MetadataComponent,
    parameters: {
      layout: "centered",
    },
  });

  const args = {
    document: {
      ...document,
      source: "NYPD",
      published_url:
        "https://www.nytimes.com/live/2024/12/10/nyregion/unitedhealthcare-ceo-luigi-mangione",
    },
  };

  const individual: Document = {
    ...document,
    organization: {
      ...(document.organization as Org),
      individual: true,
    },
  };
</script>

<Story name="Metadata" {args} />

<Story
  name="Individual org"
  args={{
    ...args,
    document: individual,
  }}
/>

<Story
  name="Signed out"
  {args}
  parameters={{
    sveltekit_experimental: { state: { page: { data: { me: undefined } } } },
  }}
/>
