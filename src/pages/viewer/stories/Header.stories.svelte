<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Header from "../Header.svelte";

  import { document } from "../../../test/fixtures/documents";
  import { Document as DocumentState } from "../../../structure/document";

  const args = {
    document: new DocumentState(document),
    loaded: true,
    title: true,
    showOrg: true,
    embed: false,
    disableControls: false,
  };

  export const meta = {
    title: "Viewer / Header",
    component: Header,
  };
</script>

<Template let:args>
  <Header {...args} />
</Template>

<Story name="Default" {args} />
<Story name="Loading" args={{ ...args, loaded: false }} />
<Story name="Without Title" args={{ ...args, title: false }} />
<Story name="Hide Org" args={{ ...args, showOrg: false }} />
<Story name="Embed" args={{ ...args, embed: true }} />
<Story name="Disable Controls" args={{ ...args, disableControls: true }} />
