<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DeleteProject from "../DeleteProject.svelte";

  import { project } from "@/test/fixtures/projects";

  const { Story } = defineMeta({
    title: "Forms / Delete project",
    component: DeleteProject,
    parameters: { layout: "centered" },
  });
</script>

<Story name="default" args={{ project }} />
