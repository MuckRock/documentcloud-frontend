<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import Share from "../Share.svelte";

  import document from "@/test/fixtures/documents/document-expanded.json";

  let args = {
    document,
    currentTab: "document",
  };

  export const meta = {
    title: "Components / Documents / Share",
    component: Share,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Share {document} {...args} />
</Template>

<Story name="Document" args={{ ...args, document }} />

<Story
  name="Private Document"
  args={{
    ...args,
    document: { ...document, access: "private", edit_access: false },
  }}
/>
<Story
  name="Organization Document"
  args={{
    ...args,
    document: { ...document, access: "organization", edit_access: false },
  }}
/>
<Story
  name="Private Document with Edit Access"
  args={{
    ...args,
    document: { ...document, access: "private", edit_access: true },
  }}
/>

<Story name="Page" args={{ ...args, document, currentTab: "page" }} />

<Story name="Note" args={{ ...args, document, currentTab: "note" }} />
