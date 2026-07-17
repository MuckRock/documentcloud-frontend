<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Projects from "../Projects.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import type { Document } from "$lib/api/types";
  const document = doc as Document;

  const { Story } = defineMeta({
    title: "Documents / Menus / Projects",
    component: Projects,
    parameters: {
      layout: "centered",
    },
    tags: ["autodocs"],
  });
</script>

<Story name="With Data" asChild>
  <Projects {document} projects={doc.projects} />
</Story>

<Story name="Empty" asChild>
  <Projects {document} projects={[]} />
</Story>
