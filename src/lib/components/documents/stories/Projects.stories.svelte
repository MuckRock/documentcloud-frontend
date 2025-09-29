<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Projects from "../Projects.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import type { Document } from "$lib/api/types";
  const document = doc as Document;

  export const meta = {
    title: "Components / Documents / Menus / Projects",
    component: Projects,
    parameters: {
      layout: "centered",
    },
    tags: ["autodocs"],
  };
</script>

<Story name="With Data">
  <Projects {document} projects={doc.projects} />
</Story>

<Story name="Empty">
  <Projects {document} projects={[]} />
</Story>
