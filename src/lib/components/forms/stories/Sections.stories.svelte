<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import EditSections from "../EditSections.svelte";

  import doc from "$lib/api/fixtures/documents/document.json";
  import sections from "$lib/api/fixtures/sections.json";

  const document = { ...doc, sections: sections.results } as Document;

  export const meta = {
    title: "Forms / Edit sections",
    component: EditSections,
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <div style="width: 22rem;">
    <EditSections {document} />
  </div>
</Story>
