<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import { Document as DocumentModel } from "../../../../structure/document.js";
  import Document from "../../Document.svelte";
  import mockDocument from "../fixtures/document.json";

  const args = {
    document: new DocumentModel(mockDocument),
    embed: false,
    dialog: false,
  };
</script>

<Meta
  title="Pages / Document"
  component={Document}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Document {...args} />
</Template>

<Story name="Default" {args} />
<Story name="Embed" args={{ ...args, embed: true }} />
<Story name="Dialog" args={{ ...args, dialog: true }} />
