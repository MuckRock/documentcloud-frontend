<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import RemoveCollaborator from "../RemoveCollaborator.svelte";

  import { project, projectUsers } from "@/test/fixtures/projects";
  const user = projectUsers.results[0]!;

  const { Story } = defineMeta({
    title: "Forms / Remove collaborator",
    component: RemoveCollaborator,
    parameters: { layout: "centered" },
  });
</script>

<Story name="default" args={{ project, user }} />
