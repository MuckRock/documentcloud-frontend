<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Documents from "../Documents.svelte";
  import { pending } from "@/test/fixtures/documents/pending";
  import ProcessContext from "../ProcessContext.svelte";
  import { writable } from "svelte/store";

  import * as mock from "@/test/handlers/documents";

  export const meta = {
    title: "Components / Processing / Documents",
    component: Documents,
    parameters: {
      layout: "centered",
    },
  };
</script>

<Story
  name="default"
  parameters={{
    msw: { handlers: [mock.documents.list, mock.documents.pending] },
  }}
>
  <ProcessContext documents={writable(pending)}>
    <Documents />
  </ProcessContext>
</Story>
