<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import RemoveCollaborator from "../RemoveCollaborator.svelte";

  export const meta = {
    title: "Forms / Remove collaborator",
    component: RemoveCollaborator,
    parameters: { layout: "centered" },
  };

  import { project, projectUsers } from "@/test/fixtures/projects";
  const user = projectUsers.results[0]!;
</script>

<Story name="default">
  <RemoveCollaborator {project} {user} />
</Story>
