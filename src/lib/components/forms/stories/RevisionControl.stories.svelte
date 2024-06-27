<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import RevisionControl from "../RevisionControl.svelte";

  export const meta = {
    title: "Forms / Revision control",
    component: RevisionControl,
    parameters: { layout: "centered" },
  };

  import { me } from "@/test/fixtures/accounts";

  import doc from "$lib/api/fixtures/documents/document-expanded.json";

  const document = { ...doc, user: me } as Document;
</script>

<Story name="default">
  <RevisionControl {document} />
</Story>
