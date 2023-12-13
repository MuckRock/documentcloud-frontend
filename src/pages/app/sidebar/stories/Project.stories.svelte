<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import Project from "../Project.svelte";

  import projects from "../../fixtures/projects.json";

  export const meta = {
    title: "App / Sidebar / Project",
    component: Project,
    parameters: { layout: "fullscreen" },
  };
</script>

<Story name="default">
  <Project project={projects.results[0]} />
</Story>
