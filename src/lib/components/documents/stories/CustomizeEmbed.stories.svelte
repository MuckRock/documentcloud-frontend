<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CustomizeEmbed, { embedSettings } from "../CustomizeEmbed.svelte";
  import { createEmbedSearchParams } from "$lib/utils/embed";

  const { Story } = defineMeta({
    title: "Documents / Customize Embed",
    component: CustomizeEmbed,
    parameters: { layout: "centered" },
  });
</script>

<Story name="Default">
  {#snippet template(args)}
    <pre><code>{createEmbedSearchParams($embedSettings)}</code></pre>
    <CustomizeEmbed {...args} />
  {/snippet}
</Story>
