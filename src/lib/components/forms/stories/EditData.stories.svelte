<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import EditData from "../EditData.svelte";

  import doc from "@/test/fixtures/documents/examples/the-santa-anas.json";

  const document = doc as Document;

  export const meta = {
    title: "Forms / Edit data",
    component: EditData,
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <EditData {document} />
</Story>
