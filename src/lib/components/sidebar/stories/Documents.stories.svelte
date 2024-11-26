<script lang="ts" context="module">
  import { activeAddons } from "@/test/fixtures/addons";
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Documents from "../Documents.svelte";
  import type { Meta } from "@storybook/svelte";

  export const meta: Meta = {
    title: "Components / Sidebar / Documents",
    component: Documents,
    parameters: { layout: "centered" },
  };

  let args = {};
</script>

<Template let:args>
  <Documents {...args} />
</Template>

<Story name="Default" />
