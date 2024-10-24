<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import ProjectAccess from "../ProjectAccess.svelte";

  export const meta = {
    title: "Components / Inputs / Project access",
    component: ProjectAccess,
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <ProjectAccess />
</Story>
