<script context="module" lang="ts">
  import type { ComponentProps } from "svelte";
  import type { Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ChangeOwner from "../ChangeOwner.svelte";

  import doc from "@/test/fixtures/documents/document.json";
  import docs from "@/test/fixtures/documents/documents.json";
  import { organizations, users } from "@/test/handlers/accounts";

  const document = doc as Document;
  const documents = docs.results as Document[];

  const { Story } = defineMeta({
    title: "Forms / Change owner",
    component: ChangeOwner,
    parameters: {
      layout: "centered",
      msw: {
        handlers: [organizations.data, users.data],
      },
    },
    render: template,
  });

  type Args = ComponentProps<typeof ChangeOwner>;
</script>

{#snippet template(args: Args)}
  <div style="max-width: 66ch;">
    <ChangeOwner {...args} />
  </div>
{/snippet}

<Story name="one document" args={{ documents: [document] }} />

<Story name="bulk change owner" args={{ documents }} />

<Story name="disabled (no documents)" args={{ documents: [] }} />

<Story
  name="bulk change owner, too many"
  args={{ documents: Array(100).fill(document) }}
/>

<Story
  name="loading state"
  parameters={{
    msw: {
      handlers: [organizations.loading, users.loading],
    },
  }}
  args={{ documents }}
/>

<Story
  name="error loading data"
  parameters={{
    msw: {
      handlers: [organizations.error, users.error],
    },
  }}
  args={{ documents }}
/>
