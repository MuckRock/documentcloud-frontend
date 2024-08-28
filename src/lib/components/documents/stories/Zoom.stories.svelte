<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Zoom from "../Zoom.svelte";

  export const meta = {
    title: "Viewer / Zoom",
    component: Zoom,
    parameters: {
      layout: "centered",
    },
    tags: ["autodocs"],
  };
</script>

<Story name="document">
  <Zoom mode="document" />
</Story>

<Story name="text">
  <Zoom mode="text" />
</Story>

<Story name="grid">
  <Zoom mode="grid" />
</Story>
