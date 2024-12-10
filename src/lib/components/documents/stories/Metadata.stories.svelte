<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import MetadataComponent from "../Metadata.svelte";
  import type { Document } from "@/lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  const document = doc as Document;

  export const meta = {
    title: "Components / Documents / Metadata",
    component: MetadataComponent,
    parameters: {
      layout: "centered",
    },
  };

  const args = {
    document: {
      ...document,
      source: "NYPD",
      published_url:
        "https://www.nytimes.com/live/2024/12/10/nyregion/unitedhealthcare-ceo-luigi-mangione",
    },
  };
</script>

<Template let:args>
  <MetadataComponent {...args} />
</Template>

<Story name="Metadata" {args} />
