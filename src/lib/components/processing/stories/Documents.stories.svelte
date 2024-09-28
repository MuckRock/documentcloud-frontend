<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Documents, { current } from "../Documents.svelte";

  import * as mock from "@/test/handlers/documents";

  export const meta = {
    title: "Components / Processing / Pending Documents",
    component: Documents,
    parameters: {
      layout: "centered",
    },
  };
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { pending } from "@/test/fixtures/documents/pending";

  onMount(() => {
    $current = pending;

    return () => {
      $current = [];
    };
  });
</script>

<Story
  name="default"
  parameters={{
    msw: { handlers: [mock.documents.list, mock.documents.pending] },
  }}
>
  <Documents />
</Story>
