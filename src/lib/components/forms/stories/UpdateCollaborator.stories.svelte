<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import UpdateCollaborator from "../UpdateCollaborator.svelte";

  export const meta = {
    title: "Forms / Update collaborator",
    component: UpdateCollaborator,
    parameters: { layout: "centered" },
  };

  import { project, projectUsers } from "@/test/fixtures/projects";
  const user = projectUsers.results[0]!;
</script>

<Story name="default">
  <UpdateCollaborator {project} {user} />
</Story>
