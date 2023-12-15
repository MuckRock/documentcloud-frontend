<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import SearchPane from "../SearchPane.svelte";

  export const meta = {
    title: "Viewer / Pane / Search Pane",
    component: SearchPane,
  };
</script>

<Story name="default">
  <SearchPane />
</Story>
