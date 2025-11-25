<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import ChangeOwner from "../ChangeOwner.svelte";

  import doc from "@/test/fixtures/documents/document.json";
  import docs from "@/test/fixtures/documents/documents.json";
  import { organizations, users } from "@/test/handlers/accounts";

  const document = doc as Document;
  const documents = docs.results as Document[];

  export const meta = {
    title: "Forms / Change owner",
    component: ChangeOwner,
    parameters: {
      layout: "centered",
      msw: {
        handlers: [organizations.data, users.data],
      },
    },
  };
</script>

<Story name="one document">
  <div style="max-width: 66ch;">
    <ChangeOwner documents={[document]} />
  </div>
</Story>

<Story name="bulk change owner">
  <div style="max-width: 66ch;">
    <ChangeOwner {documents} />
  </div>
</Story>

<Story name="disabled (no documents)">
  <div style="max-width: 66ch;">
    <ChangeOwner documents={[]} />
  </div>
</Story>

<Story name="bulk change owner, too many">
  <div style="max-width: 66ch;">
    <ChangeOwner documents={Array(100).fill(document)} />
  </div>
</Story>

<Story
  name="loading state"
  parameters={{
    msw: {
      handlers: [organizations.loading, users.loading],
    },
  }}
>
  <div style="max-width: 66ch;">
    <ChangeOwner {documents} />
  </div>
</Story>

<Story
  name="empty organizations"
  parameters={{
    msw: {
      handlers: [organizations.empty, users.data],
    },
  }}
>
  <div style="max-width: 66ch;">
    <ChangeOwner {documents} />
  </div>
</Story>

<Story
  name="error loading data"
  parameters={{
    msw: {
      handlers: [organizations.error, users.error],
    },
  }}
>
  <div style="max-width: 66ch;">
    <ChangeOwner {documents} />
  </div>
</Story>
