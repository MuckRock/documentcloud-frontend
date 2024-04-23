<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import RedactPane from "../RedactPane.svelte";

  export const meta = {
    title: "Viewer / Pane / Redact Pane",
    component: RedactPane,
  };
</script>

<Story name="default">
  <RedactPane />
</Story>
