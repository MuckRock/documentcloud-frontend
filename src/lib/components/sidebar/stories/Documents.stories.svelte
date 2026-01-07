<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Documents from "../Documents.svelte";
  import type { Meta } from "@storybook/svelte";

  export const meta: Meta = {
    title: "Navigation / Documents",
    component: Documents,
    parameters: { layout: "centered" }
  };
</script>

<Template let:args>
  <Documents {...args} />
</Template>

<Story name="Signed In" />

<Story
  name="Signed Out"
  parameters={{signedOut: true}}
>
  <Documents />
</Story>

