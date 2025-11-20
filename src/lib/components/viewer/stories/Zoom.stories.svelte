<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import Zoom from "../Zoom.svelte";

  export const meta = {
    title: "Viewer / Zoom",
    component: Zoom,
    parameters: {
      layout: "centered",
    },
    tags: ["autodocs"],
  };

  let args = {
    mode: "document",
  };
</script>

<Template let:args>
  <Zoom {...args} />
</Template>

<Story name="Document Zoom" {args} />

<Story name="Text Zoom" args={{ ...args, mode: "text" }} />

<Story name="Grid Zoom" args={{ ...args, mode: "grid" }} />
