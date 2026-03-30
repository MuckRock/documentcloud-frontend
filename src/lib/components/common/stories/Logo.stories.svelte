<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Logo from "../Logo.svelte";

  const { Story } = defineMeta({
    title: "Common / Logo",
    component: Logo,
    parameters: { layout: "centered" },
  });
</script>

<Story name="Logo" />
