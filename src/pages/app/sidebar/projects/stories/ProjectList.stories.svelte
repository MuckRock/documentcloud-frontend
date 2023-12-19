<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import ProjectList from "../ProjectList.svelte";

  import { projects } from "../../../stories/mock";

  export const meta = {
    title: "App / Sidebar / Project List",
    component: ProjectList,
    parameters: {
      layout: "centered",
      chromatic: { delay: 300 },
      msw: {
        handlers: [projects.data],
      },
    },
  };

  const args = {
    user: { id: 1 },
    newProject: action("New Project"),
    editProject: action("Edit Project"),
  };
</script>

<Template let:args>
  <div class="sidebar"><ProjectList {...args} /></div>
</Template>

<Story name="Data" {args} parameters={{ msw: { handlers: [projects.data] } }} />
<Story
  name="Empty"
  args={{ ...args }}
  parameters={{ msw: { handlers: [projects.empty] } }}
/>
<Story
  name="Loading"
  args={{ ...args }}
  parameters={{ msw: { handlers: [projects.loading] } }}
/>
<Story
  name="Error"
  args={{ ...args }}
  parameters={{ msw: { handlers: [projects.error] } }}
/>

<style>
  .sidebar {
    padding: 1.5rem 0;
    width: var(--sidebar-width);
    background-color: var(--sidebar);
  }
</style>
