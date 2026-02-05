<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import Project from "../Project.svelte";
  import { project, projectUsers } from "@/test/fixtures/projects";
  import { documentsList } from "@/test/fixtures/documents";

  const { Story } = defineMeta({
    title: "Layout / Project",
    component: Project,
    parameters: {
      layout: "fullscreen",
    },
  });
</script>

<Story
  name="Viewer"
  args={{
    project: project,
    users: projectUsers.results,
    documents: Promise.resolve({ data: documentsList }),
  }}
/>

<Story
  name="Editor"
  args={{
    project: { ...project, edit_access: true },
    users: projectUsers.results,
    documents: Promise.resolve({ data: documentsList }),
  }}
/>

<Story
  name="Admin"
  args={{
    project: { ...project, edit_access: true, add_remove_access: true },
    users: projectUsers.results,
    documents: Promise.resolve({ data: documentsList }),
  }}
/>
