<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import InviteCollaborator from "../InviteCollaborator.svelte";

  export const meta = {
    title: "Forms / Invite collaborator",
    component: InviteCollaborator,
    parameters: { layout: "centered" },
  };

  import { project, projectUsers } from "@/test/fixtures/projects";
  const user = projectUsers.results[0];
</script>

<Story name="default">
  <div style="max-width: 88ch;">
    <InviteCollaborator {project} />
  </div>
</Story>
