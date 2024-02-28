<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import { Pencil16 } from "svelte-octicons";
  import Action from "../Action.svelte";

  export const meta = {
    title: "Components / Common / Action",
    component: Action,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Text Only">
  <Action>Open</Action>
</Story>

<Story name="Text and Icon">
  <Action icon={Pencil16}>Edit</Action>
</Story>
