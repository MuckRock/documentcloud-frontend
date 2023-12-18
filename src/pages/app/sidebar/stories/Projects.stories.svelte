<script context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import Projects from "../Projects.svelte";

  import projectFixtures from "../../fixtures/projects.json";

  export const meta = {
    title: "App / Sidebar / Projects",
    component: Projects,
    parameters: { layout: "fullscreen" },
  };

  const args = {
    projects: projectFixtures.results,
    newProject: action("New Project"),
  };
</script>

<Template let:args>
  <Projects {...args} />
</Template>

<Story name="With Projects" {args} />
<Story name="Empty" args={{ ...args, projects: [] }} />
