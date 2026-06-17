<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ProjectAccess from "../ProjectAccess.svelte";

  const { Story } = defineMeta({
    title: "Forms / Inputs /Project access",
    component: ProjectAccess,
    parameters: { layout: "centered" },
  });
</script>

<Story name="default" />
