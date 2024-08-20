<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import DocumentListItem from "../DocumentListItem.svelte";

  import document from "@/test/fixtures/documents/document.json";
  import expanded from "@/test/fixtures/documents/document-expanded.json";
  import santaanas from "@/test/fixtures/documents/examples/the-santa-anas.json";

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

<Story name="notes" args={{ document: santaanas }} />

<Story name="pending" args={{ document: { ...document, status: "pending" } }} />

<Story name="error" args={{ document: { ...document, status: "error" } }} />

<Story name="no file" args={{ document: { ...document, status: "nofile" } }} />
