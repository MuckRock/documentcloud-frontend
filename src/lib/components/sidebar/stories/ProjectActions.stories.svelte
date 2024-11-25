<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import ProjectActions from "../ProjectActions.svelte";

  import { project } from "@/test/fixtures/projects";

  export const meta = {
    title: "Components / Sidebar / Project Actions",
    component: ProjectActions,
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <ProjectActions {project} />
</Story>
