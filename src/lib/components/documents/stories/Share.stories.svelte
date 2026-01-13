<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import Share from "../Share.svelte";
  import Toaster from "../../layouts/Toaster.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  const document = doc as Document;

  export const meta = {
    title: "Documents / Share",
    component: Share,
  };
</script>

<Story name="Document">
  <Share {document} currentTab="document" />
  <Toaster />
</Story>

<Story name="Private Document">
  <Share
    document={{ ...document, access: "private", edit_access: false }}
    currentTab="document"
  />
  <Toaster />
</Story>

<Story name="Organization Document">
  <Share
    document={{ ...document, access: "organization", edit_access: false }}
    currentTab="document"
  />
  <Toaster />
</Story>

<Story name="Private Document with Edit Access">
  <Share
    document={{ ...document, access: "private", edit_access: true }}
    currentTab="document"
  />
  <Toaster />
</Story>

<Story name="Page">
  <Share {document} currentTab="page" />
  <Toaster />
</Story>

<Story name="Note">
  <Share {document} currentTab="note" />
  <Toaster />
</Story>

<style>
  .vh-100 {
    height: 100vh;
  }
  .vw-100 {
    width: 100vw;
  }
</style>
