<script context="module" lang="ts">
  import type { Document } from "@/lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import ConfirmRedaction from "../ConfirmRedaction.svelte";

  import doc from "$lib/api/fixtures/documents/document.json";

  const document = doc as Document;

  export const meta = {
    title: "Forms / Confirm redaction",
    component: ConfirmRedaction,
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <div style="max-width: 66ch;">
    <ConfirmRedaction {document} />
  </div>
</Story>
