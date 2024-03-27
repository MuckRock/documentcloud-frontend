<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import { projectList } from "../../test/fixtures/projects";
  import ProjectList from "../ProjectList.svelte";

  const args = {
    items: projectList.results,
    loading: false,
    error: null,
  };

  export const meta = {
    title: "App / Projects / List",
    component: ProjectList,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <ProjectList {...args} />
</Template>

<Story name="With Data" {args} />
<Story
  name="With Own Data"
  args={{
    ...args,
    items: projectList.results.map((project) => ({
      ...project,
      edit_access: true,
    })),
  }}
/>
<Story
  name="With Shared Data"
  args={{
    ...args,
    items: projectList.results.map((project) => ({
      ...project,
      edit_access: project.user === 4,
    })),
  }}
/>
<Story name="Empty" args={{ ...args, items: [] }} />
<Story name="Loading" args={{ ...args, loading: true }} />
<Story name="Error" args={{ ...args, error: "An error occurred!" }} />
