<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import DocumentListItem, {
    defaultVisibleFields,
  } from "../DocumentListItem.svelte";

  import document from "@/test/fixtures/documents/document.json";
  import expanded from "@/test/fixtures/documents/document-expanded.json";
  import santaanas from "@/test/fixtures/documents/examples/the-santa-anas.json";
  import { projectList } from "@/test/fixtures/projects";
  import { data } from "@/test/fixtures/documents";

  export const meta = {
    title: "Components / Documents / Document List Item",
    component: DocumentListItem,
    tags: ["autodocs"],
    parameters: {
      layout: "centered",
    },
  };
</script>

<Template let:args>
  <div class="wrapper">
    <DocumentListItem {...args} />
  </div>
</Template>

<Story
  name="Basic"
  args={{
    document: { ...expanded, data },
    visibleFields: defaultVisibleFields,
  }}
/>

<Story
  name="With Short Description"
  args={{
    document: {
      ...expanded,
      description:
        "Makes David Cameron the new prime minister and installs Nick Clegg as his deputy",
    },
    visibleFields: { ...defaultVisibleFields, description: true },
  }}
/>

<Story
  name="With Long Description"
  args={{
    document: expanded,
    visibleFields: { ...defaultVisibleFields, description: true },
  }}
/>

<Story
  name="With Many Projects"
  args={{
    document: {
      ...expanded,
      projects: projectList.results.slice(0, 7),
      visibleFields: { ...defaultVisibleFields, thumbnail: true },
    },
  }}
/>

<Story
  name="With Much Data"
  args={{
    document: {
      ...expanded,
      data,
      projects: projectList.results.slice(0, 7),
    },
    visibleFields: { ...defaultVisibleFields, data: true, thumbnail: true },
  }}
/>

<Story
  name="Minimal"
  args={{
    document,
    visibleFields: {
      meta: false,
      thumbnail: false,
      description: false,
      projects: false,
      data: false,
    },
  }}
/>

<Story
  name="Maximal"
  args={{
    document: {
      ...expanded,
      projects: projectList.results.slice(0, 7),
      data,
    },
    visibleFields: {
      thumbnail: true,
      description: true,
      projects: true,
      data: true,
    },
  }}
/>

<Story
  name="Truncate Title"
  args={{
    document: {
      ...expanded,
      description:
        "Makes David Cameron the new prime minister and installs Nick Clegg as his deputy",
    },
    visibleFields: {
      ...defaultVisibleFields,
      description: true,
      fullTitle: false,
    },
  }}
/>

<Story name="notes" args={{ document: santaanas }} />

<Story name="pending" args={{ document: { ...document, status: "pending" } }} />

<Story name="error" args={{ document: { ...document, status: "error" } }} />

<Story name="no file" args={{ document: { ...document, status: "nofile" } }} />

<Story
  name="Org Access"
  args={{ document: { ...expanded, access: "organization" } }}
/>

<Story
  name="Private Access"
  args={{ document: { ...expanded, access: "private" } }}
/>

<style>
  .wrapper {
    max-width: 64rem;
  }
</style>
