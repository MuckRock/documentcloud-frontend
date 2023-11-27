<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Footer from "../Footer.svelte";

  const args = {
    disableControls: false,
    compact: false,
    embed: false,
    showFullscreen: false,
  };
</script>

<Meta title="Viewer / Footer" component={Footer} />

<Template let:args>
  <Footer {...args} />
</Template>

<Story name="Default" {args} />
<Story name="Compact" args={{ ...args, compact: true }} />
<Story name="Disable Controls" args={{ ...args, disableControls: true }} />
<Story name="Embedded" args={{ ...args, embed: true }} />
<Story
  name="Fullscreen"
  args={{ ...args, embed: true, showFullscreen: true }}
/>
