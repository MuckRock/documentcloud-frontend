<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Dropdown from "./Dropdown.demo.svelte";

  const args = {};

  export const meta = {
    title: "Common / Dropdown",
    tags: ["autodocs"],
    component: Dropdown,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Dropdown {...args} />
</Template>

<Story name="Default" {args} />
<Story name="Without Overlay" args={{ ...args, overlay: false }} />
