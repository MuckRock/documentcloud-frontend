<script lang="ts" context="module">
  import type { Meta } from "@storybook/svelte";
  import { Story } from "@storybook/addon-svelte-csf";
  import Project from "../Project.svelte";

  import { project, projectUsers } from "@/test/fixtures/projects";
  import { documentsList } from "@/test/fixtures/documents";
  import { activeAddons } from "@/test/fixtures/addons";

  export const meta: Meta = {
    title: "Layout / Project",
    component: Project,
    parameters: {
      layout: "fullscreen",
    },
  };

  const args = {
    project,
    users: projectUsers.results,
    documents: Promise.resolve({ data: documentsList }),
    addons: Promise.resolve(activeAddons),
  };
</script>

<Story name="Viewer">
  <div class="vh-100">
    <Project {...args} />
  </div>
</Story>

<Story name="Editor">
  <div class="vh-100">
    <Project
      project={{ ...project, edit_access: true }}
      users={projectUsers.results}
      documents={Promise.resolve({ data: documentsList })}
    />
  </div>
</Story>

<Story name="Admin">
  <div class="vh-100">
    <Project
      project={{ ...project, edit_access: true, add_remove_access: true }}
      users={projectUsers.results}
      documents={Promise.resolve({ data: documentsList })}
    />
  </div>
</Story>

<style>
  .vh-100 {
    height: 100vh;
  }
</style>
