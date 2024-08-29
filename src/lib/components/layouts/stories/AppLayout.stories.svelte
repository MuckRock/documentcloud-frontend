<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import AppLayout from "../AppLayout.svelte";
  import type { Document } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import txt from "@/test/fixtures/documents/document.txt.json";
  const document = doc as Document;

  import { addons } from "@/test/handlers/addons";
  import DocumentLayout from "../DocumentLayout.svelte";

  export const meta = {
    title: "Layout / App",
    component: AppLayout,
    parameters: {
      layout: "fullscreen",
      msw: {
        handlers: [addons.data],
      },
      sveltekit_experimental: {
        stores: {
          page: {
            url: "/",
          },
        },
      },
    },
  };

  let args = {};
</script>

<Template let:args>
  <div class="vh">
    <AppLayout {...args}>
      <DocumentLayout
        document={{ ...document, edit_access: true }}
        mode={"document"}
        text={txt}
        query=""
      />
    </AppLayout>
  </div>
</Template>

<Story name="Desktop" {...args} />

<Story
  name="Tablet (H)"
  parameters={{
    viewport: { defaultOrientation: "landscape", defaultViewport: "tablet" },
  }}
  {...args}
/>

<Story
  name="Tablet (V)"
  parameters={{
    viewport: { defaultOrientation: "tablet", defaultViewport: "tablet" },
  }}
  {...args}
/>

<Story
  name="Mobile (L)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile2" },
  }}
  {...args}
/>

<Story
  name="Mobile (S)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile1" },
  }}
  {...args}
/>

<style>
  .vh {
    height: 100vh;
  }
</style>
