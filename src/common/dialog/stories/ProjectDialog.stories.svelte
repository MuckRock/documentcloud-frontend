<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import ProjectDialog from "../ProjectDialog.svelte";
  import { project } from "../../../api/fixtures/projects.fixtures";
  import { action } from "@storybook/addon-actions";

  const args = {
    loading: false,
    editing: false,
    initialData: { name: "", description: "", private: false },
    showCollaborators: action("Show Collaborators"),
    embedProject: action("Embed Project"),
  };

  export const meta = {
    title: "Dialogs / Project",
    component: ProjectDialog,
    parameters: {
      layout: "centered",
      chromatic: { delay: 1000 },
    },
    argTypes: {
      loading: {
        control: {
          type: "boolean",
        },
      },
      editing: {
        control: {
          type: "boolean",
        },
      },
      onSave: {
        action: "Save",
      },
      onDelete: {
        action: "Delete",
      },
      onCancel: {
        action: "Cancel",
      },
    },
  };
</script>

<Template let:args>
  <ProjectDialog {...args} />
</Template>

<Story name="Create Project" {args} />
<Story
  name="Edit Project"
  args={{
    ...args,
    editing: true,
    initialData: {
      name: project.title,
      description: project.description,
      private: project.private,
    },
  }}
/>
<Story name="Loading" args={{ ...args, loading: true }} />
