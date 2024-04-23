<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import AnnotatePane from "../AnnotatePane.svelte";

  export const meta = {
    title: "Viewer / Pane / Annotate Pane",
    component: AnnotatePane,
  };
</script>

<Story name="default">
  <AnnotatePane />
</Story>
