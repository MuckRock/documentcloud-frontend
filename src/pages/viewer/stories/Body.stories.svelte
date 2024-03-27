<script lang="ts" context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import Body from "../Body.svelte";
  import { Document } from "../../../structure/document.js";
  import { document } from "../../../test/fixtures/documents";
  import { doc } from "../../../viewer/document.js";
  import { viewer } from "../../../viewer/viewer.js";

  export const meta = {
    title: "Viewer / Body",
    component: Body,
    parameters: { layout: "centered" },
  };

  // not clear this does anything useful
  viewer.doc = new Document(document);
  // @ts-ignore
  doc.viewer = viewer;
</script>

<Story name="default">
  <Body />
</Story>
