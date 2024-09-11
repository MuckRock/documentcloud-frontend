<script context="module" lang="ts">
  import type { Project } from "@/lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import ProjectActions from "../ProjectActions.svelte";

  import { project } from "@/test/fixtures/projects";

  export const meta = {
    title: "Components / Projects / Actions",
    component: ProjectActions,
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <ProjectActions {project} users={[]} />
</Story>
