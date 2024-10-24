<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import DocumentLayout from "../DocumentLayout.svelte";

  import type { Document } from "@/lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import txt from "@/test/fixtures/documents/document.txt.json";
  import { activeAddons } from "@/test/fixtures/addons";
  import { writable } from "svelte/store";
  const document = doc as Document;

  export const meta = {
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
  };

  let args = {
    document: writable(document),
    mode: "document",
    text: txt,
    query: "",
    addons: Promise.resolve(activeAddons),
  };
</script>

<Template let:args>
  <div class="vh">
    <DocumentLayout {...args} />
  </div>
</Template>

<Story name="With Read Access" {args} />

<Story
  name="With Edit Access"
  args={{
    ...args,
    document: {
      ...document,
      edit_access: true,
    },
  }}
/>

<Story
  name="Without Description"
  args={{
    ...args,
    document: {
      ...document,
      description: "",
      edit_access: true,
    },
  }}
/>

<Story name="With Processing Document" {args} />

<style>
  .vh {
    height: 100vh;
  }
</style>
