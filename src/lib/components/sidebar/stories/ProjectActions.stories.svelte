<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import ProjectActions from "../ProjectActions.svelte";
  import { project } from "@/test/fixtures/projects";

  const { Story } = defineMeta({
    title: "Navigation / Project Actions",
    component: ProjectActions,
    parameters: { layout: "centered" },
  });
</script>

<Story name="default" args={{ project }} />
