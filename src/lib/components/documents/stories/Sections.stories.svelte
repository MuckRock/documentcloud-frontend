<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import Sections from "../Sections.svelte";

  import doc from "@/test/fixtures/documents/document.json";

  const document = doc as Document;

  export const meta = {
    title: "Components / Documents / Menus / Sections",
    component: Sections,
    parameters: {
      layout: "centered",
    },
    tags: ["autodocs"],
  };
</script>

<Story name="Empty">
  <Sections {document} />
</Story>
