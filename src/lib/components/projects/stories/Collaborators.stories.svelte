<script module lang="ts">
  import type { ProjectUser } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Collaborators from "../Collaborators.svelte";

  import { project } from "@/test/fixtures/projects";
  import * as membership from "@/test/fixtures/projects/project-users.json";

  const users = membership.results as ProjectUser[];

  const { Story } = defineMeta({
    title: "Projects / Collaborators",
    component: Collaborators,
    parameters: { layout: "centered" },
  });
</script>

<Story name="default" asChild>
  <Collaborators {project} {users} />
</Story>

<Story name="manage" asChild>
  <Collaborators
    {users}
    project={{ ...project, add_remove_access: true, edit_access: true }}
  />
</Story>

<Story name="empty" asChild>
  <Collaborators project={{ ...project, add_remove_access: true }} users={[]} />
</Story>
