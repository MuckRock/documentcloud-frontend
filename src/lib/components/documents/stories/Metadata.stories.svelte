<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MetadataComponent from "../Metadata.svelte";
  import type { Document } from "$lib/api/types";

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
</script>

<Story name="Metadata" {args} />
<Story
  name="Signed out"
  {args}
  parameters={{
    sveltekit_experimental: { state: { page: { data: { me: undefined } } } },
  }}
/>
