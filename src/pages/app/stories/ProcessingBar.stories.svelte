<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import ProcessingBar from "../ProcessingBar.svelte";

  import { documents } from "../../../manager/documents.js";

  documents.doneProcessing = false;

  export const meta = {
    title: "App / Documents / Processing Bar",
    component: ProcessingBar,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <ProcessingBar />
</Story>
