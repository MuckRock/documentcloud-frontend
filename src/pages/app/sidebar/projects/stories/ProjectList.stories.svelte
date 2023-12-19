<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import ProjectList from "../ProjectList.svelte";

  import projectFixtures from "../../../fixtures/projects.json";

  export const meta = {
    title: "App / Sidebar / Project List",
    component: ProjectList,
    parameters: { layout: "centered" },
  };

  const args = {
    projects: projectFixtures.results,
    newProject: action("New Project"),
    editProject: action("Edit Project"),
  };
</script>

<Template let:args>
  <div class="sidebar"><ProjectList {...args} /></div>
</Template>

<Story name="With Projects" {args} />
<Story name="Empty" args={{ ...args, projects: [] }} />

<style>
  .sidebar {
    padding: 1.5rem 0;
    width: var(--sidebar-width);
    background-color: var(--sidebar);
  }
</style>
