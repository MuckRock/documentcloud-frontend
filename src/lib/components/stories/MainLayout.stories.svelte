<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import MainLayout from "../MainLayout.svelte";
  import type { Document } from "$lib/api/types";

  import documents from "../../api/fixtures/documents/documents.json";
  import DocumentListItem from "../documents/DocumentListItem.svelte";

  let docList = documents.results as Document[];

  export const meta = {
    title: "Components / Main Layout",
    component: MainLayout,
    parameters: { layout: "fullscreen" },
  };
</script>

<Template>
  <MainLayout>
    <div slot="content" style="width: 100%;">
      {#each docList as document}
        <DocumentListItem {document} />
      {/each}
    </div>
    <ul slot="navigation">
      <li>Nav #1</li>
      <li>Nav #2</li>
      <li>Nav #3</li>
    </ul>
    <ul slot="action">
      <li>Action #1</li>
      <li>Action #2</li>
      <li>Action #3</li>
    </ul>
  </MainLayout>
</Template>

<Story name="Desktop" />

<Story
  name="Tablet (H)"
  parameters={{
    viewport: { defaultOrientation: "landscape", defaultViewport: "tablet" },
  }}
/>

<Story
  name="Tablet (V)"
  parameters={{
    viewport: { defaultOrientation: "tablet", defaultViewport: "tablet" },
  }}
/>

<Story
  name="Mobile (L)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile2" },
  }}
/>

<Story
  name="Mobile (S)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile1" },
  }}
/>
