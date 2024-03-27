<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import AddonStatus from "../AddonStatus.svelte";
  import { progress as handlers } from "../../../test/handlers/addons";

  const args = {};

  export const meta = {
    title: "Add-Ons / Progress / Status",
    component: AddonStatus,
  };
</script>

<Template let:args>
  <AddonStatus {...args} />
</Template>

<Story name="Status" {args} parameters={{ msw: { handlers } }} />
