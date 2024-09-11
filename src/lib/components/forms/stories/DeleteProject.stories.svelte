<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import DeleteProject from "../DeleteProject.svelte";

  import { project } from "@/test/fixtures/projects";

  export const meta = {
    title: "Forms / Delete project",
    component: DeleteProject,
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <DeleteProject {project} />
</Story>
