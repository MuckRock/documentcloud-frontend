<script module lang="ts">
  import type { ComponentProps } from "svelte";
  import type { Document } from "$lib/api/types";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DocumentListItem from "../DocumentListItem.svelte";
  import { defaultVisibleFields } from "../VisibleFields.svelte";

  import documentFixture from "@/test/fixtures/documents/document.json";
  import expandedFixture from "@/test/fixtures/documents/document-expanded.json";
  import santaanasFixture from "@/test/fixtures/documents/examples/the-santa-anas.json";
  import { projectList } from "@/test/fixtures/projects";
  import { data } from "@/test/fixtures/documents";

  const document = documentFixture as Document;
  const expanded = expandedFixture as Document;
  const santaanas = santaanasFixture as Document;

  const { Story } = defineMeta({
    title: "Documents / Document List Item",
    component: DocumentListItem,
    tags: ["autodocs"],
    parameters: {
      layout: "centered",
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof DocumentListItem>)}
  <div class="wrapper">
    <DocumentListItem {...args} />
  </div>
{/snippet}

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
    },
    visibleFields: { ...defaultVisibleFields, thumbnail: true },
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
  name="Wrap title"
  args={{
    document: {
      ...expanded,
      description:
        "Makes David Cameron the new prime minister and installs Nick Clegg as his deputy",
    },
    visibleFields: {
      ...defaultVisibleFields,
      description: true,
    },
  }}
/>

<Story
  name="Wrap title without breaks"
  args={{
    document: {
      ...expanded,
      title:
        "Makes%20David%20Cameron%20the%20new%20prime%20minister%20and%20installs%20Nick%20Clegg%20as%20his%20deputy",
      description:
        "Makes David Cameron the new prime minister and installs Nick Clegg as his deputy",
    },
    visibleFields: {
      ...defaultVisibleFields,
      description: true,
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
