<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Header from "../Header.svelte";

  import documentFixture from "../fixtures/document.json";
  import { Document as DocumentState } from "../../../structure/document";

  const args = {
    document: new DocumentState(documentFixture),
    loaded: true,
    title: true,
    showOrg: true,
    embed: false,
    disableControls: false,
  };
</script>

<Meta title="Viewer / Header" component={Header} />

<Template let:args>
  <Header {...args} />
</Template>

<Story name="Default" {args} />
<Story name="Loading" args={{ ...args, loaded: false }} />
<Story name="Without Title" args={{ ...args, title: false }} />
<Story name="Hide Org" args={{ ...args, showOrg: false }} />
<Story name="Embed" args={{ ...args, embed: true }} />
<Story name="Disable Controls" args={{ ...args, disableControls: true }} />
