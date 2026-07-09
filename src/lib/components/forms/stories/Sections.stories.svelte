<script module lang="ts">
  import type { Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import EditSections from "../EditSections.svelte";

  import doc from "@/test/fixtures/documents/document.json";
  import sections from "@/test/fixtures/sections.json";

  const document = { ...doc, sections: sections.results } as Document;

  const { Story } = defineMeta({
    title: "Forms / Edit sections",
    component: EditSections,
    parameters: { layout: "centered" },
    render: template,
  });
</script>

{#snippet template(args)}
  <div style="width: 22rem;">
    <EditSections {...args} />
  </div>
{/snippet}

<Story name="default" args={{ document }} />
