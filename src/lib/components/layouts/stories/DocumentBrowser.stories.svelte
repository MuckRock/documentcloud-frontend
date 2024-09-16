<script context="module" lang="ts">
  import type { Meta } from "@storybook/svelte";

  import { Story, Template } from "@storybook/addon-svelte-csf";
  import DocumentBrowser from "../DocumentBrowser.svelte";

  import { documentsList } from "@/test/fixtures/documents";

  export const meta: Meta = {
    title: "Layout / Document Browser",
    component: DocumentBrowser,
    parameters: {
      layout: "fullscreen",
    },
  };

  const args = {
    documents: Promise.resolve(documentsList),
  };
</script>

<Template let:args>
  <DocumentBrowser {...args} />
</Template>

<Story name="With Data" {args} />
