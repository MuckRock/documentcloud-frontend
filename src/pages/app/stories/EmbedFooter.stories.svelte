<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import EmbedFooter from "../EmbedFooter.svelte";

  export const meta = {
    title: "App / Embed / Footer",
    component: EmbedFooter,
    parameters: { layout: "fullscreen" },
  };

  const args = {
    dialog: false,
  };
</script>

<Template let:args>
  <EmbedFooter {...args} />
</Template>

<Story name="Footer" {args} />
