<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Projects from "../Projects.svelte";

  import { projectList } from "@/test/fixtures/projects";
  import { document, documentsList } from "@/test/fixtures/documents";

  export const meta = {
    title: "Forms / Projects",
    component: Projects,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Without Projects">
  <Projects projects={[]} documents={[document]} />
</Story>

<Story name="one document">
  <Projects projects={projectList.results} documents={[document]} />
</Story>

<Story name="many documents">
  <Projects projects={projectList.results} documents={documentsList.results} />
</Story>

<Story name="too many documents">
  <Projects
    projects={projectList.results}
    documents={Array(100).fill(document)}
  />
</Story>
