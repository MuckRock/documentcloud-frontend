<script module lang="ts">
  import type { Document } from "$lib/api/types";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import RevisionControl from "../RevisionControl.svelte";

  import { me } from "@/test/fixtures/accounts";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = { ...doc, user: me } as Document;

  const { Story } = defineMeta({
    title: "Forms / Revision control",
    component: RevisionControl,
    parameters: { layout: "centered" },
  });
</script>

<Story name="Enabled" args={{ document }} />

<Story name="Disabled" args={{ document, disabled: true }} />
