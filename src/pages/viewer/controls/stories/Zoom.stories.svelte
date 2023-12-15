<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import Zoom from "../Zoom.svelte";

  export const meta = {
    title: "Viewer / Controls / Zoom",
    component: Zoom,
  };
</script>

<Story name="default">
  <Zoom />
</Story>
