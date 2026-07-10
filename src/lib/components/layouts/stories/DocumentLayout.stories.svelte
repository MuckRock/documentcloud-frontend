<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DocumentLayout from "../DocumentLayout.svelte";

  import type { Document } from "$lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import txt from "@/test/fixtures/documents/document.txt.json";
  import { writable } from "svelte/store";
  const document = doc as Document;

  const { Story } = defineMeta({
    title: "Layout / Document",
    component: DocumentLayout,
    parameters: {
      layout: "fullscreen",
      sveltekit_experimental: {
        stores: {
          page: {
            url: "/",
          },
        },
      },
    },
  });

  const args = {
    documentStore: writable(document),
    text: Promise.resolve(txt),
  };
</script>

{#snippet template(args)}
  <div class="vh">
    <DocumentLayout {...args} />
  </div>
{/snippet}

<Story name="With Read Access" {args} {template} />

<Story
  name="With Edit Access"
  args={{
    ...args,
    documentStore: writable({
      ...document,
      edit_access: true,
    }),
  }}
  {template}
/>

<Story
  name="Without Description"
  args={{
    ...args,
    documentStore: writable({
      ...document,
      description: "",
      edit_access: true,
    }),
  }}
  {template}
/>

<Story name="With Processing Document" {args} {template} />

<style>
  .vh {
    height: 100vh;
  }
</style>
