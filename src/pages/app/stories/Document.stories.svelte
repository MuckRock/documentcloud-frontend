<script context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Document from "../Document.svelte";

  import * as structure from "../../../structure/document.js";
  import { document } from "../../../test/fixtures/documents";

  export const meta = {
    title: "App / Documents / Document",
    component: Document,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  const args = {
    document: new structure.Document(document),
    embed: false,
    dialog: false,
  };
</script>

<Template let:args>
  <Document {...args} />
</Template>

<Story name="default" {args} />

<Story name="embed" args={{ ...args, embed: true }} />

<Story name="dialog" args={{ ...args, dialog: true }} />
