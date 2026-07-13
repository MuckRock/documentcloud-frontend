<script module lang="ts">
  import type { Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ConfirmRedaction from "../ConfirmRedaction.svelte";

  import doc from "@/test/fixtures/documents/document.json";

  const document = doc as Document;

  const { Story } = defineMeta({
    title: "Forms / Confirm redaction",
    component: ConfirmRedaction,
    parameters: { layout: "centered" },
    render: template,
  });
</script>

{#snippet template(args)}
  <div style="max-width: 66ch;">
    <ConfirmRedaction {...args} />
  </div>
{/snippet}

<Story name="default" args={{ document }} />
