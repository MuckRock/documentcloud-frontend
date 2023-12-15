<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import SelectNotePane from "../SelectNotePane.svelte";

  export const meta = {
    title: "Viewer / Pane / Select Note Pane",
    component: SelectNotePane,
  };
</script>

<Story name="default">
  <SelectNotePane />
</Story>
