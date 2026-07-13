<script module lang="ts">
  import type { Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Share from "../Share.svelte";
  import Toaster from "$lib/components/layouts/Toaster.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  const document = doc as Document;

  const { Story } = defineMeta({
    title: "Documents / Share",
    component: Share,
    parameters: { layout: "centered" },
    render: template,
  });
</script>

{#snippet template(args)}
  <Share {...args} />
  <Toaster />
{/snippet}

<Story name="Document" args={{ document, currentTab: "document" }} />

<Story
  name="Private Document"
  args={{
    document: { ...document, access: "private", edit_access: false },
    currentTab: "document",
  }}
/>

<Story
  name="Organization Document"
  args={{
    document: { ...document, access: "organization", edit_access: false },
    currentTab: "document",
  }}
/>

<Story
  name="Private Document with Edit Access"
  args={{
    document: { ...document, access: "private", edit_access: true },
    currentTab: "document",
  }}
/>

<Story name="Page" args={{ document, currentTab: "page" }} />

<Story name="Note" args={{ document, currentTab: "note" }} />
