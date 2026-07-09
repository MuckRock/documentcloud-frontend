<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import InviteCollaborator from "../InviteCollaborator.svelte";

  import { project, projectUsers } from "@/test/fixtures/projects";
  const user = projectUsers.results[0];

  const { Story } = defineMeta({
    title: "Forms / Invite collaborator",
    component: InviteCollaborator,
    parameters: { layout: "centered" },
    render: template,
  });
</script>

{#snippet template(args)}
  <div style="max-width: 88ch;">
    <InviteCollaborator {...args} />
  </div>
{/snippet}

<Story name="default" args={{ project }} />
