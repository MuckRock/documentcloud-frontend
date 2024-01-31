<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import Body from "../Body.svelte";
  import { Document } from "../../../structure/document.js";
  import document from "../fixtures/document.json";

  import { doc } from "@/viewer/document.js";
  import { viewer } from "../../../viewer/viewer.js";

  export const meta = {
    title: "Viewer / Body",
    component: Body,
    parameters: { layout: "centered" },
  };

  // not clear this does anything useful
  viewer.doc = new Document(document);
  doc.viewer = viewer;
</script>

<Story name="default">
  <Body />
</Story>
