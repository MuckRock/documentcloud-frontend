<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import EditProject from "../EditProject.svelte";

  import { project } from "@/test/fixtures/projects";

  const { Story } = defineMeta({
    title: "Forms / Edit project",
    component: EditProject,
    parameters: { layout: "centered" },
    render: template,
  });
</script>

{#snippet template(args)}
  <div>
    <EditProject {...args} />
  </div>
{/snippet}

<Story name="create project" args={{}} />

<Story name="update project" args={{ project }} />

<style>
  div {
    min-width: 400px;
  }
</style>
