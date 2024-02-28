<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Logo from "../common/Logo.svelte";

  export const meta = {
    title: "Components / Common / Logo",
    component: Logo,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Logo" id="logo">
  <Logo />
</Story>
