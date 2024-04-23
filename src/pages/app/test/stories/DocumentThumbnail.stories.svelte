<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import DocumentThumbnail from "../../DocumentThumbnail.svelte";

  import { document } from "../../../../test/fixtures/documents";
  import { Document } from "../../../../structure/document";

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

<Meta
  title="Pages / Document / Thumbnail"
  component={DocumentThumbnail}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <DocumentThumbnail {...args} />
</Template>

<Story name="Viewable" {args} />
<Story
  name="Unviewable"
  args={{ ...args, document: { ...args.document, viewable: false } }}
/>
<Story name="Embed" args={{ ...args, embed: true }} />
<Story name="Dialog" args={{ ...args, dialog: true }} />
<Story
  name="With Notes"
  args={{
    ...args,
    noteCount: 4,
    publicNote: true,
    orgNote: true,
    privateNote: true,
  }}
/>
