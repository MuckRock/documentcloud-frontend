<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import ModifyPane from "../ModifyPane.svelte";

  export const meta = {
    title: "Viewer / Pane / Modify Pane",
    component: ModifyPane,
  };
</script>

<Story name="default">
  <ModifyPane />
</Story>
