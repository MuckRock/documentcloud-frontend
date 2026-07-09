<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import UpdateCollaborator from "../UpdateCollaborator.svelte";

  import { project, projectUsers } from "@/test/fixtures/projects";
  const user = projectUsers.results[0]!;

  const { Story } = defineMeta({
    title: "Forms / Update collaborator",
    component: UpdateCollaborator,
    parameters: { layout: "centered" },
  });
</script>

<Story name="default" args={{ project, user }} />
