<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AddOnNavigation from "../AddOnsNavigation.svelte";

  const { Story } = defineMeta({
    title: "Add-Ons /Navigation",
    component: AddOnNavigation,
    parameters: { layout: "centered" },
  });

  let args = {
    active: "all",
  };
</script>

<Story name="Navigation" {args} />
