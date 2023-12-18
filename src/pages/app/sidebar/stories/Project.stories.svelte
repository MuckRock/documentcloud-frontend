<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import ProjectComponent from "../Project.svelte";

  import projects from "../../fixtures/projects.json";

  export const meta = {
    title: "App / Sidebar / Project",
    component: ProjectComponent,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Project">
  <ProjectComponent project={projects.results[0]} />
</Story>
