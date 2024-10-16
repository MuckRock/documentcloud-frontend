<script context="module" lang="ts">
  import type { ProjectUser } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import Collaborators from "../Collaborators.svelte";

  export const meta = {
    title: "Components / Projects / Collaborators",
    component: Collaborators,
    parameters: { layout: "centered" },
  };

  import { project } from "@/test/fixtures/projects";
  import * as membership from "@/test/fixtures/projects/project-users.json";

  const users = membership.results as ProjectUser[];
</script>

<Story name="default">
  <Collaborators {project} {users} />
</Story>

<Story name="manage">
  <Collaborators
    {users}
    project={{ ...project, add_remove_access: true, edit_access: true }}
  />
</Story>

<Story name="empty">
  <Collaborators project={{ ...project, add_remove_access: true }} users={[]} />
</Story>
