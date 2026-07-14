<script module lang="ts">
  import type { Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Share from "../Share.svelte";
  import Toaster from "$lib/components/layouts/Toaster.svelte";

  import * as documents from "$lib/api/documents";
  import { APP_URL } from "@/config/config.js";
  import doc from "@/test/fixtures/documents/document-expanded.json";
  const document = doc as Document;

  // The fixture is a real production document. It only exists in whichever
  // environment its canonical URL points at, so compare that origin against
  // the environment Storybook is currently pointed at.
  const fixtureExistsHere = (() => {
    try {
      return new URL(document.canonical_url).origin === new URL(APP_URL).origin;
    } catch {
      return false;
    }
  })();

  // When the fixture exists in this environment, let its iframe load the live
  // embed. Otherwise mock the preview so the iframe doesn't request a document
  // that isn't there, and tell the user how to load a real one.
  const previewSrcdoc = fixtureExistsHere
    ? undefined
    : `<div style="font:14px/1.5 sans-serif;color:#333;padding:1rem;height:100%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:.5rem">
    <strong>Embed preview (mocked)</strong>
    <p style="margin:0">
      This fixture document doesn't exist in the current environment
      (<code>${new URL(APP_URL).host}</code>). To load a real embed, set the
      <code>documentId</code> field in the <strong>Controls</strong> panel to a
      document ID that exists here. The live embed will render in its place.
    </p>
</div>`;

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
