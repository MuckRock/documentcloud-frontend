<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Sidebar from "../Sidebar.svelte";
  import documentFixture from "../fixtures/document.json";
  import { Document as DocumentState } from "../../../structure/document";

  const args = {
    document: new DocumentState(documentFixture),
    loaded: true,
    signedIn: true,
    disableControls: false,
  };

  export const meta = {
    title: "Viewer / Sidebar",
    component: Sidebar,
  };
</script>

<Template let:args>
  <Sidebar {...args} />
</Template>

<Story name="Default" {args} />
<Story name="Unloaded" args={{ ...args, loaded: false }} />
<Story name="Signed Out" args={{ ...args, signedIn: false }} />
<Story name="Disable Controls" args={{ ...args, disableControls: true }} />
<Story
  name="Uneditable"
  args={{
    ...args,
    document: new DocumentState({ ...documentFixture, edit_access: false }),
  }}
/>
