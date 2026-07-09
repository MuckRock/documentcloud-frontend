<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Projects from "../Projects.svelte";

  import { projectList } from "@/test/fixtures/projects";
  import { document, documentsList } from "@/test/fixtures/documents";

  const { Story } = defineMeta({
    title: "Forms / Projects",
    component: Projects,
    parameters: { layout: "centered" },
  });
</script>

<Story
  name="Without Projects"
  args={{ projects: [], documents: [document] }}
/>

<Story
  name="one document"
  args={{ projects: projectList.results, documents: [document] }}
/>

<Story
  name="many documents"
  args={{ projects: projectList.results, documents: documentsList.results }}
/>

<Story
  name="too many documents"
  args={{ projects: projectList.results, documents: Array(100).fill(document) }}
/>
