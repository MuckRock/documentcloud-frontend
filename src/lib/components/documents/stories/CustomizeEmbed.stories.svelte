<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import CustomizeEmbed, { embedSettings } from "../CustomizeEmbed.svelte";
  import { createEmbedSearchParams } from "$lib/utils/embed";

  let args = {};

  export const meta = {
    title: "Components / Documents / Customize Embed",
    component: CustomizeEmbed,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <pre><code>{createEmbedSearchParams($embedSettings)}</code></pre>
  <CustomizeEmbed {document} {...args} />
</Template>

<Story name="Default" args={{ ...args, document }} />
