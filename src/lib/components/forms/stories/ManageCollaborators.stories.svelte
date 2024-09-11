<script context="module" lang="ts">
  import type { ProjectUser } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import ManageCollaborators from "../ManageCollaborators.svelte";

  import { project } from "@/test/fixtures/projects";
  import { results } from "@/test/fixtures/projects/project-users.json";

  const users = results as ProjectUser[];

  export const meta = {
    title: "Forms / Manage Collaborators",
    component: ManageCollaborators,
    parameters: { layout: "centered" },
  };
</script>

<Story name="with users">
  <div style="max-width: 100ch;">
    <ManageCollaborators {project} {users} />
  </div>
</Story>

<Story name="no users">
  <div style="max-width: 100ch;">
    <ManageCollaborators {project} users={[]} />
  </div>
</Story>
