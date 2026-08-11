<script module lang="ts">
  import type { Access, Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Share from "../Share.svelte";
  import Toaster from "$lib/components/layouts/Toaster.svelte";

  import * as documents from "$lib/api/documents";
  import { APP_URL } from "@/config/config.js";
  import doc from "@/test/fixtures/documents/document-expanded.json";
  const document = doc as Document;

  // The fixture is a real production document, so a live preview iframe would
  // pull the embed from embed.documentcloud.org and its PDF from
  // s3.documentcloud.org. Those requests make the story depend on the network:
  // they are unavailable or non-deterministic wherever Storybook is built
  // without access to production (Chromatic snapshots, offline work), which
  // shows up as blank or flickering embed previews. Always mock the preview so
  // every story in this file renders from local state only. Setting
  // `documentId` in the Controls panel opts back into a live embed.
  const previewSrcdoc = `<div style="font:14px/1.5 sans-serif;color:#333;padding:1rem;height:100%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:.5rem">
    <strong>Embed preview (mocked)</strong>
    <p style="margin:0">
      The preview iframe is mocked so this story never depends on the network.
      To load a real embed, set the <code>documentId</code> field in the
      <strong>Controls</strong> panel to a document ID that exists in the
      current environment (<code>${new URL(APP_URL).host}</code>). The live
      embed will render in its place.
    </p>
</div>`;

  // Every note on the fixture is public, so restrict the first one — the one the
  // note tab selects by default — to see the note access warnings.
  function withNote(access: Access, edit_access = false): Document {
    const [first, ...rest] = document.notes ?? [];
    return {
      ...document,
      notes: [{ ...first!, access, edit_access }, ...rest],
    };
  }

  const { Story } = defineMeta({
    title: "Forms / Share",
    component: Share,
    // parameters: { layout: "full" },
    args: { previewSrcdoc },
    argTypes: {
      documentId: {
        control: "text",
        description:
          "Load a real document (by ID) from the current environment's API to see a live embed preview. Overrides the fixture and the mocked iframe.",
      },
    },
    render: template,
  });
</script>

{#snippet template({ documentId, ...args })}
  {#if documentId}
    {#await documents.get(documentId)}
      <p>Loading document {documentId}…</p>
    {:then response}
      {#if response.data}
        <!-- Real document from the current environment: drop the mock so the
             iframe loads the live embed for the matching environment. -->
        <Share {...args} document={response.data} previewSrcdoc={undefined} />
      {:else}
        <p>Could not load document {documentId}.</p>
      {/if}
    {/await}
  {:else}
    <Share {...args} document={args.document ?? document} />
  {/if}
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

<Story
  name="Private Note"
  args={{ document: withNote("private"), currentTab: "note" }}
/>

<Story
  name="Collaborators Note"
  args={{ document: withNote("organization"), currentTab: "note" }}
/>

<Story
  name="Private Note with Edit Access"
  args={{ document: withNote("private", true), currentTab: "note" }}
/>

<!-- The note is public but the document isn't, so the document is what needs fixing. -->
<Story
  name="Public Note on a Private Document"
  args={{
    document: { ...withNote("public"), access: "private", edit_access: true },
    currentTab: "note",
  }}
/>
