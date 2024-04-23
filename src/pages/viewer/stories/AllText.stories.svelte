<script lang="ts" context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import AllText from "../AllText.svelte";

  import { Document } from "../../../structure/document.js";
  import { viewer } from "../../../viewer/viewer.js";
  import { document } from "../../../test/fixtures/documents";

  viewer.document = new Document(document);

  export const meta = {
    title: "Viewer / Text / All text",
    component: AllText,
    parameters: { layout: "centered" },
  };

  const scrollParams = { scrollTop: 0 };
</script>

<Story name="default">
  <AllText {scrollParams} />
</Story>
