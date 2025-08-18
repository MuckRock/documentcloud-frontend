<script lang="ts" context="module">
  import type { Meta } from "@storybook/svelte";
  import LoadingToolbar from "../LoadingToolbar.svelte";
  import { Story, Template } from "@storybook/addon-svelte-csf";

  export const meta: Meta = {
    title: "Components / Viewer / Toolbars / Loading",
    component: LoadingToolbar,
    parameters: {
      layout: "fullscreen",
    },
  };

  let args = {
    progress: 0.5,
  };
</script>

<Template let:args>
  <LoadingToolbar {...args} />
</Template>

<Story name="With Progress" {args} />
<Story name="Indeterminate" args={{ ...args, progress: undefined }} />
