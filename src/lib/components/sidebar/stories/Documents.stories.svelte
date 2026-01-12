<script lang="ts" context="module">
  import type { Meta } from "@storybook/svelte";
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Documents from "../Documents.svelte";

  export const meta: Meta = {
    title: "Navigation / Documents",
    component: Documents,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Documents {...args} />
</Template>

<Story name="Signed In" />

<Story name="Signed Out" parameters={{ signedOut: true }}>
  <Documents />
</Story>
