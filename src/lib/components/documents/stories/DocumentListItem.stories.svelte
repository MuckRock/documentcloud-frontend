<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import DocumentListItem from "../DocumentListItem.svelte";

  import document from "../../../api/fixtures/documents/document.json";
  import expanded from "../../../api/fixtures/documents/document-expanded.json";

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

<Story name="pending" args={{ document: { ...document, status: "pending" } }} />

<Story name="error" args={{ document: { ...document, status: "error" } }} />

<Story name="no file" args={{ document: { ...document, status: "nofile" } }} />
