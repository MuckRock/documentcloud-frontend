<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import DocumentListItem from "../documents/DocumentListItem.svelte";

  import document from "../../api/fixtures/documents/document.json";
  import expanded from "../../api/fixtures/documents/document-expanded.json";

  export const meta = {
    title: "Components / Documents / Document List Item",
    component: DocumentListItem,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <DocumentListItem {...args} />
</Template>

<Story name="default" args={{ document: expanded }} />

<Story name="minimal" args={{ document }} />
