<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import EditProject from "../EditProject.svelte";

  export const meta = {
    title: "Forms / Edit project",
    component: EditProject,
    parameters: { layout: "centered" },
  };

  import { project } from "@/test/fixtures/projects";
</script>

<Story name="create project">
  <div>
    <EditProject />
  </div>
</Story>

<Story name="update project">
  <div>
    <EditProject {project} />
  </div>
</Story>

<style>
  div {
    min-width: 400px;
  }
</style>
