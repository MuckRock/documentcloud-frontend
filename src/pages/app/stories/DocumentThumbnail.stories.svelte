<script context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import DocumentThumbnail from "../DocumentThumbnail.svelte";

  import { Document } from "../../../structure/document.js";
  import document from "../fixtures/document.json";

  export const meta = {
    title: "App / Documents / Document Thumbnail",
    component: DocumentThumbnail,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  const args = {
    document: new Document(document),
    embed: false,
    dialog: false,
    noteCount: 0,
    publicNote: false,
    orgNote: false,
    privateNote: false,
  };
</script>

<Template let:args>
  <DocumentThumbnail {...args} />
</Template>

<Story name="default" {args} />

<Story name="embed" args={{ ...args, embed: true }} />

<Story name="dialog" args={{ ...args, dialog: true }} />

<Story
  name="notes"
  args={{
    ...args,
    noteCount: 5,
    publicNote: true,
    privateNote: true,
    orgNote: true,
  }}
/>
