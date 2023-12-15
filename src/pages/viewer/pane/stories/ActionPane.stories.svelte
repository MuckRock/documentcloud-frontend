<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import ActionPane from "../ActionPane.svelte";

  export const meta = {
    title: "Viewer / Pane / Action Pane",
    component: ActionPane,
  };
</script>

<Story name="default">
  <ActionPane />
</Story>
