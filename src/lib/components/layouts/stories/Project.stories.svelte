<script lang="ts" context="module">
  import type { Meta } from "@storybook/svelte";
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Project from "../Project.svelte";

  import { project, projectUsers } from "@/test/fixtures/projects";
  import { documentsList } from "@/test/fixtures/documents";

  export const meta: Meta = {
    title: "Layout / Project",
    component: Project,
    parameters: {
      layout: "fullscreen",
    },
  };

  let args = {
    project,
    users: projectUsers.results,
    documents: Promise.resolve(documentsList),
  };
</script>

<Template let:args>
  <div class="vh-100">
    <Project {...args} />
  </div>
</Template>

<Story name="Viewer" {args} />
<Story
  name="Editor"
  args={{ ...args, project: { ...project, edit_access: true } }}
/>
<Story
  name="Admin"
  args={{
    ...args,
    project: { ...project, edit_access: true, add_remove_access: true },
  }}
/>

<style>
  .vh-100 {
    height: 100vh;
  }
</style>
